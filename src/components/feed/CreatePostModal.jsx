import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiX, FiUpload, FiTrash2 } from "react-icons/fi";
import CreatableSelect from "react-select/creatable";
import Button from "../common/Button";
import Input from "../common/Input";
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
    description: "",
    category: null,
    subcategory: null,
  });

  // Sync with store when modal opens
  useEffect(() => {
    if (isOpen && postFormData) {
      setFormData(postFormData);
    }
  }, [isOpen, postFormData]);

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
      
      // Invalidate and refetch to show the new post immediately
      queryClient.invalidateQueries(["posts"]);
      queryClient.refetchQueries(["posts"], { active: true });
      queryClient.invalidateQueries(["mySubscription"]);
      queryClient.invalidateQueries(["profile"]);
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
      !formData.description ||
      !formData.category ||
      !formData.subcategory
    ) {
      showError("Please fill in all required fields");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("requirement", formData.requirement);
    data.append("description", formData.description);
    data.append("category", formData.category.value);
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
      description: "",
      category: null,
      subcategory: null,
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
          <Input
            label="Title *"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Enter post title"
            required
          />

          {/* Requirement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Requirement *
            </label>
            <textarea
              value={formData.requirement}
              onChange={(e) =>
                setFormData({ ...formData, requirement: e.target.value })
              }
              placeholder="Describe what you need"
              rows={3}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <CreatableSelect
              value={formData.category}
              onChange={(option) =>
                setFormData({
                  ...formData,
                  category: option,
                  subcategory: null,
                })
              }
              options={categoryOptions}
              placeholder="Select or create a category"
              styles={customStyles}
              isClearable
            />
          </div>

          {/* Subcategory */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subcategory *
            </label>
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

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Detailed description of your requirement"
              rows={5}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
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
