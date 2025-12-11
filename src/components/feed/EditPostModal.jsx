import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiX, FiUpload, FiTrash2 } from "react-icons/fi";
import CreatableSelect from "react-select/creatable";
import Button from "../common/Button";
import Input from "../common/Input";
import Select from "../common/Select";
import { postService } from "../../services/post.service";
import { showSuccess, showError } from "../../utils/toast";
import { usePostStore } from "../../store/postStore";
import { categoryOptions, subcategoryOptions, unitOptions } from "../../constants/PostFormUnitData";
import SwitchToggle from "../common/SwitchToggle";

const EditPostModal = ({ isOpen, onClose, post }) => {
  const queryClient = useQueryClient();
  const {
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
    description: "",
    editableDescription: "",
    quantity: "",
    unit: "pcs",
    customUnit: "",
    hsnCode: "",
    category: null,
    subcategory: null,
    otherCategory: "",
    isCreator: true,
    validityPeriod: 7,
  });

  // Sync with post data when modal opens
  useEffect(() => {
    if (isOpen && post) {
      // Parse the description to separate the template from editable content
      const descriptionLines = post.description.split('\n');
      let editableContent = "";
      
      // Find the line where editable content starts (after "Detailed Specifications:")
      const detailedSpecsIndex = descriptionLines.findIndex(line => line.includes("Detailed Specifications:"));
      if (detailedSpecsIndex !== -1 && detailedSpecsIndex < descriptionLines.length - 1) {
        // Extract editable content (everything after "Detailed Specifications:" until "Additional Notes:")
        const endIndex = descriptionLines.findIndex((line, index) => index > detailedSpecsIndex && line.includes("Additional Notes:"));
        if (endIndex !== -1) {
          editableContent = descriptionLines.slice(detailedSpecsIndex + 1, endIndex).join('\n').trim();
        } else {
          editableContent = descriptionLines.slice(detailedSpecsIndex + 1).join('\n').trim();
        }
      }
      
      setFormData({
        title: post.title || "",
        requirement: post.requirement || "",
        description: post.description || "",
        editableDescription: editableContent,
        quantity: post.quantity || "",
        unit: post.unit || "pcs",
        customUnit: "",
        hsnCode: post.hsnCode || "",
        category: { value: post.category, label: post.category },
        subcategory: { value: post.subcategory, label: post.subcategory },
        otherCategory: "",
        isCreator: post.isCreator || true,
        validityPeriod: post.validityPeriod || 7,
      });
    }
  }, [isOpen, post]);

  const editPostMutation = useMutation({
    mutationFn: (data) => postService.editPost(post._id, data),
    onSuccess: (response) => {
      showSuccess("Post updated successfully!");
      
      // Update the post in the feed
      queryClient.setQueryData(["posts", true], (oldData) => {
        if (!oldData) return oldData;
        
        const newData = {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            posts: page.posts.map(p => 
              p._id === post._id ? { ...p, ...response.post } : p
            ),
          })),
        };
        
        return newData;
      });
      
      handleClose();
    },
    onError: (error) => {
      showError(error.response?.data?.message || "Failed to update post");
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

    const data = {
      title: formData.title,
      requirement: formData.requirement,
      description: formattedDescription,
      quantity: formData.quantity,
      unit: unitToUse,
      hsnCode: formData.hsnCode,
      category: formData.category.value === "other" 
        ? formData.otherCategory 
        : formData.category.value,
      subcategory: formData.subcategory.value,
    };

    editPostMutation.mutate(data);
  };

  const handleClose = () => {
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
            Edit Post
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
          
          {/* Switch Toggle for Creator/Prospect */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Post Type
            </label>
            <SwitchToggle
              isChecked={formData.isCreator}
              onChange={(checked) => setFormData({ ...formData, isCreator: checked })}
              enabledLabel="Creator"
              disabledLabel="Prospect"
              className="mb-2"
              disabled={true} // Disable editing post type
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formData.isCreator 
                ? "As a creator, you're offering this product/service" 
                : "As a prospect, you're looking for this product/service"}
            </p>
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

          {/* Validity Period Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Post Validity Period
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              How long should this post remain active?
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, validityPeriod: 7 })}
                className={`py-3 px-4 rounded-lg border transition-colors ${
                  formData.validityPeriod === 7
                    ? "border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300"
                    : "border-gray-300 dark:border-gray-600 hover:border-sky-300 dark:hover:border-sky-700"
                }`}
                disabled={true} // Disable editing validity period
              >
                <div className="font-semibold">7 Days</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Standard</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, validityPeriod: 15 })}
                className={`py-3 px-4 rounded-lg border transition-colors ${
                  formData.validityPeriod === 15
                    ? "border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300"
                    : "border-gray-300 dark:border-gray-600 hover:border-sky-300 dark:hover:border-sky-700"
                }`}
                disabled={true} // Disable editing validity period
              >
                <div className="font-semibold">15 Days</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Extended</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, validityPeriod: 30 })}
                className={`py-3 px-4 rounded-lg border transition-colors ${
                  formData.validityPeriod === 30
                    ? "border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300"
                    : "border-gray-300 dark:border-gray-600 hover:border-sky-300 dark:hover:border-sky-700"
                }`}
                disabled={true} // Disable editing validity period
              >
                <div className="font-semibold">30 Days</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Premium</div>
              </button>
            </div>
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
                {`Product Request: ${formData.title || '[Title will be inserted here]'}

Required Quantity: ${formData.quantity || '[Quantity]'} ${formData.unit === "other" ? formData.customUnit || '[Unit]' : formData.unit || '[Unit]'}
HSN Code: ${formData.hsnCode || '[HSN Code will be inserted here]'}

Basic Requirements: ${formData.requirement || '[Requirements will be inserted here]'}

Detailed Specifications: `}
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
              disabled={editPostMutation.isPending}
              className="flex-1 bg-sky-500 hover:bg-sky-600"
            >
              {editPostMutation.isPending ? "Updating..." : "Update Post"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;