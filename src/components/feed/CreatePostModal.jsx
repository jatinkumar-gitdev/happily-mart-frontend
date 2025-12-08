import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiX, FiUpload, FiTrash2 } from "react-icons/fi";
import CreatableSelect from "react-select/creatable";
import Button from "../common/Button";
import Input from "../common/Input";
import Select from "../common/Select";
import { postService } from "../../services/post.service";
import { showSuccess, showError } from "../../utils/toast";
import { usePostStore } from "../../store/postStore";
import { useAuthStore } from "../../store/authStore";

const CreatePostModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();
  const {
    postFormData,
    updateFormData,
    images,
    imagePreviews,
    addImage,
    removeImage: removeImageFromStore,
    resetForm,
  } = usePostStore();

  // Local state for form control
  const [formData, setFormData] = useState({
    title: "",
    requirement: "",
    description: "", // Will be populated with template
    editableDescription: "", // User's custom content
    quantity: "",
    unit: "pcs", // Default unit
    customUnit: "", // For custom unit when "other" is selected
    hsnCode: "",
    category: null,
    subcategory: null,
    otherCategory: "",
  });
  
  // Ref for description field
  const descriptionRef = useRef(null);

  // Sync with store when modal opens
  useEffect(() => {
    if (isOpen && postFormData) {
      setFormData(postFormData);
    }
  }, [isOpen, postFormData]);
  
  // Initialize the description template
  useEffect(() => {
    const template = `Product Request: [Title will be inserted here]

Required Quantity: [Quantity] [Unit]
HSN Code: [HSN Code will be inserted here]

Basic Requirements: [Requirements will be inserted here]

Detailed Specifications: 
[Please provide detailed specifications here. Include information such as product specifications, preferred brands, quality standards, packaging requirements, delivery expectations, and any other relevant details.]

Additional Notes: 
[Please ensure all specifications meet industry standards and quality certifications.]

----
`;
    setFormData(prev => ({ ...prev, description: template }));
  }, []);

  // Update only dynamic parts of description when key fields change
  useEffect(() => {
    // Get current description template
    let updatedDescription = `Product Request: ${formData.title || '[Title will be inserted here]'}

Required Quantity: ${formData.quantity || '[Quantity]'} ${formData.unit === "other" ? formData.customUnit || '[Unit]' : formData.unit || '[Unit]'}
HSN Code: ${formData.hsnCode || '[HSN Code will be inserted here]'}

Basic Requirements: ${formData.requirement || '[Requirements will be inserted here]'}

Detailed Specifications: 
[Please provide detailed specifications here. Include information such as product specifications, preferred brands, quality standards, packaging requirements, delivery expectations, and any other relevant details.]

Additional Notes: 
[Please ensure all specifications meet industry standards and quality certifications.]

----
`;
    setFormData(prev => ({ ...prev, description: updatedDescription }));
  }, [formData.title, formData.quantity, formData.unit, formData.customUnit, formData.hsnCode, formData.requirement]);

  // Predefined options
  const categoryOptions = [
    { value: "Electronics", label: "Electronics" },
    { value: "Fashion", label: "Fashion" },
    { value: "Home & Garden", label: "Home & Garden" },
    { value: "Sports", label: "Sports" },
    { value: "Automotive", label: "Automotive" },
    { value: "Books", label: "Books" },
    { value: "Toys & Games", label: "Toys & Games" },
    { value: "Health & Beauty", label: "Health & Beauty" },
    { value: "other", label: "Other" },
  ];

  const subcategoryOptions = {
    Electronics: [
      { value: "Mobile Phones", label: "Mobile Phones" },
      { value: "Laptops", label: "Laptops" },
      { value: "Cameras", label: "Cameras" },
      { value: "Accessories", label: "Accessories" },
    ],
    Fashion: [
      { value: "Men's Clothing", label: "Men's Clothing" },
      { value: "Women's Clothing", label: "Women's Clothing" },
      { value: "Shoes", label: "Shoes" },
      { value: "Accessories", label: "Accessories" },
    ],
    "Home & Garden": [
      { value: "Furniture", label: "Furniture" },
      { value: "Decor", label: "Decor" },
      { value: "Kitchen", label: "Kitchen" },
      { value: "Garden Tools", label: "Garden Tools" },
    ],
    // Add more subcategories as needed
  };

  // Unit options for the select dropdown
  const unitOptions = [
    { value: "pcs", label: "Pieces (pcs)" },
    { value: "kg", label: "Kilograms (kg)" },
    { value: "g", label: "Grams (g)" },
    { value: "l", label: "Liters (l)" },
    { value: "ml", label: "Milliliters (ml)" },
    { value: "m", label: "Meters (m)" },
    { value: "cm", label: "Centimeters (cm)" },
    { value: "box", label: "Boxes (box)" },
    { value: "pack", label: "Packs (pack)" },
    { value: "set", label: "Sets (set)" },
    { value: "pair", label: "Pairs (pair)" },
    { value: "other", label: "Other" },
  ];

  const createPostMutation = useMutation({
    mutationFn: (data) => postService.createPost(data),
    onSuccess: (response) => {
      showSuccess("Post created successfully!");
      
      // Update user credits in auth store
      if (response.remainingCreateCredits !== undefined) {
        updateUser({
          createCredits: response.remainingCreateCredits,
          credits: response.remainingCredits,
        });
      }
      
      // Instead of optimistically adding to cache, invalidate and refetch to ensure consistency
      queryClient.invalidateQueries(["posts", true]);
      queryClient.refetchQueries({ queryKey: ["posts", true], type: "active" });
      queryClient.invalidateQueries(["mySubscription"]);
      queryClient.invalidateQueries(["profile"]);
      
      // Notify parent component to show loading simulation
      if (window.onPostCreated) {
        window.onPostCreated();
      }
      
      handleClose();
    },
    onError: (error) => {
      showError(error.response?.data?.message || "Failed to create post");
    },
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > 5) {
      showError("Maximum 5 images allowed");
      return;
    }

    // Validate file sizes
    const invalidFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      showError("Each image must be less than 5MB");
      return;
    }

    // Add images to store
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        addImage(file, reader.result);
      };
      reader.readAsDataURL(file);
    });

    // Clear input
    e.target.value = null;
  };

  const removeImage = (index) => {
    removeImageFromStore(index);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.requirement ||
      !formData.quantity ||
      !formData.hsnCode ||
      !formData.category ||
      (formData.category.value === "other" && !formData.otherCategory) ||
      !formData.subcategory
    ) {
      showError("Please fill in all required fields");
      return;
    }

    // Format the description with built-in static text and user's editable content
    const unitToUse = formData.unit === "other" ? formData.customUnit : formData.unit;
    
    const formattedDescription = `Product Request: ${formData.title || '[Title not provided]'}

Required Quantity: ${formData.quantity || '[Quantity not specified]'} ${unitToUse || ''}
HSN Code: ${formData.hsnCode || '[HSN Code not provided]'}

Basic Requirements: ${formData.requirement || '[Requirements not specified]'}

Detailed Specifications: 
${formData.editableDescription || '[Please provide detailed specifications here. Include information such as product specifications, preferred brands, quality standards, packaging requirements, delivery expectations, and any other relevant details.]'}

Additional Notes: 
[Please ensure all specifications meet industry standards and quality certifications.]`;

    const data = new FormData();
    data.append("title", formData.title);
    data.append("requirement", formData.requirement);
    data.append("description", formattedDescription);
    data.append("quantity", formData.quantity);
    
    // Append the appropriate unit
    data.append("unit", unitToUse);
    
    data.append("hsnCode", formData.hsnCode);
    
    // Handle category (use otherCategory if 'other' is selected)
    const categoryValue = formData.category.value === "other" 
      ? formData.otherCategory 
      : formData.category.value;
    data.append("category", categoryValue);
    
    data.append("subcategory", formData.subcategory.value);

    images.forEach((image) => {
      data.append("images", image);
    });

    createPostMutation.mutate(data);
  };

  const handleClose = () => {
    // Reset form and store
    setFormData({
      title: "",
      requirement: "",
      description: `Product Request: [Title will be inserted here]

Required Quantity: [Quantity] [Unit]
HSN Code: [HSN Code will be inserted here]

Basic Requirements: [Requirements will be inserted here]

Detailed Specifications: 
[Please provide detailed specifications here. Include information such as product specifications, preferred brands, quality standards, packaging requirements, delivery expectations, and any other relevant details.]

Additional Notes: 
[Please ensure all specifications meet industry standards and quality certifications.]

----
`,
      editableDescription: "",
      quantity: "",
      unit: "pcs",
      customUnit: "",
      hsnCode: "",
      category: null,
      subcategory: null,
      otherCategory: "",
    });
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: "#ffffff",
      borderColor: "rgb(209 213 219)",
      "&:hover": {
        borderColor: "rgb(156 163 175)",
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#ffffff",
      zIndex: 99999,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "rgb(224 242 254)" : "#ffffff",
      color: "#1f2937",
      "&:hover": {
        backgroundColor: "rgb(224 242 254)",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: "#1f2937",
    }),
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Post
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Enter a clear and descriptive title for your product request
            </p>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter post title"
              required
            />
          </div>
          
          {/* Purchase Quantity Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Purchase Quantity *
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Specify the quantity and unit of measurement you need
            </p>
            <div className="flex gap-2">
              {/* Quantity Input */}
              <input
                type="text"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                placeholder="Enter quantity"
                required
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              
              {/* Unit Select with Custom Input for "Other" */}
              <div className="w-48">
                <Select
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  options={unitOptions}
                  placeholder="Select unit"
                />
                {formData.unit === "other" && (
                  <input
                    type="text"
                    value={formData.customUnit}
                    onChange={(e) =>
                      setFormData({ ...formData, customUnit: e.target.value })
                    }
                    placeholder="Enter custom unit"
                    className="mt-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* HSN Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              HSN Code *
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Enter the Harmonized System Nomenclature code for your product
            </p>
            <Input
              type="text"
              value={formData.hsnCode}
              onChange={(e) =>
                setFormData({ ...formData, hsnCode: e.target.value })
              }
              placeholder="Enter HSN code"
              required
            />
          </div>

          {/* Requirement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Requirement *
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Briefly describe what you need (e.g. Brand, Model, Specifications)
            </p>
            <textarea
              value={formData.requirement}
              onChange={(e) =>
                setFormData({ ...formData, requirement: e.target.value })
              }
              placeholder="Briefly describe what you need (e.g. Brand, Model, Specifications)"
              rows={3}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This should be a brief summary. Detailed requirements go in the description field below.
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Select or create a category for your product
            </p>
            <CreatableSelect
              value={formData.category}
              onChange={(option) =>
                setFormData({
                  ...formData,
                  category: option,
                  subcategory: null,
                  otherCategory: "",
                })
              }
              options={categoryOptions}
              placeholder="Select or create a category"
              styles={customStyles}
              isClearable
            />
            
            {/* Additional input for 'Other' category */}
            {formData.category?.value === "other" && (
              <div className="mt-3">
                <Input
                  label="Specify Category *"
                  type="text"
                  value={formData.otherCategory}
                  onChange={(e) =>
                    setFormData({ ...formData, otherCategory: e.target.value })
                  }
                  placeholder="Enter category name"
                  required
                />
              </div>
            )}
          </div>

          {/* Subcategory */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subcategory *
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Select or create a subcategory for your product
            </p>
            <CreatableSelect
              value={formData.subcategory}
              onChange={(option) =>
                setFormData({ ...formData, subcategory: option })
              }
              options={
                formData.category?.value &&
                subcategoryOptions[formData.category.value]
                  ? subcategoryOptions[formData.category.value]
                  : []
              }
              placeholder="Select or create a subcategory"
              styles={customStyles}
              isClearable
              isDisabled={!formData.category}
            />
          </div>

          {/* Requirement in Description with Built-in Static Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Requirement in Description *
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Enter detailed specifications, preferred brands, quality requirements, etc.
            </p>
            
            {/* Static Template Display (Non-editable) */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-2 font-mono text-sm">
              <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                {formData.description}
              </pre>
            </div>
            
            {/* Editable Section */}
            <textarea
              value={formData.editableDescription}
              onChange={(e) => {
                setFormData({ ...formData, editableDescription: e.target.value });
              }}
              placeholder="Enter your detailed specifications here..."
              rows={6}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              The template above is fixed and cannot be edited. Enter your detailed specifications in the text area below.
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Images (Optional - Max 5 images, 5MB each)
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="images"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <FiUpload className="text-4xl text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Click to upload images
                </span>
              </label>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPostMutation.isPending}
              className="flex-1 bg-sky-500 hover:bg-sky-600"
            >
              {createPostMutation.isPending ? "Creating..." : "Create Post"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;