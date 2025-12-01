import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FiImage,
  FiVideo,
  FiBarChart2,
  FiPaperclip,
  FiX,
} from "react-icons/fi";
import { postService } from "../../services/post.service";
import { useAuthStore } from "../../store/authStore";
import Button from "../common/Button";
import Input from "../common/Input";
import { getAvatarUrl } from "../../utils/avatarUtils";
import { showSuccess, showError } from "../../utils/toast";

const CreatePost = ({ open, onClose } = {}) => {
  const [title, setTitle] = useState("");
  const [requirement, setRequirement] = useState("");
  const [description, setDescription] = useState("");
  // REMOVED: unlockPrice state
  const [showForm, setShowForm] = useState(!!open);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Sync with controlled `open` prop when provided
  useEffect(() => {
    if (typeof open === "boolean") setShowForm(!!open);
  }, [open]);

  const createPostMutation = useMutation({
    mutationFn: (data) => postService.createPost(data),
    onSuccess: () => {
      showSuccess("Post created successfully!");
      queryClient.invalidateQueries(["posts"]);
      setTitle("");
      setRequirement("");
      setDescription("");
      // REMOVED: setUnlockPrice("");
      setShowForm(false);
    },
    onError: (error) => {
      showError(error.response?.data?.message || "Failed to create post");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createPostMutation.mutate({
      title,
      requirement,
      description,
      // REMOVED: unlockPrice
    });
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (!showForm) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[--primary] bg-sky-500 dark:bg-sky-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user?.avatar ? (
              <img
                src={getAvatarUrl(user.avatar)}
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextElementSibling.style.display = "flex";
                }}
              />
            ) : null}
            <span
              className={`text-white text-sm font-semibold ${
                user?.avatar
                  ? "hidden"
                  : "flex items-center justify-center w-full h-full"
              }`}
            >
              {getInitials(user?.name)}
            </span>
          </div>
          <div className="flex-1">
            <button
              onClick={() => {
                if (typeof open === "boolean") {
                  // parent controls visibility; try informing parent via onClose if available
                  if (typeof onClose === "function") onClose(true);
                } else {
                  setShowForm(true);
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-left text-gray-500 dark:text-gray-400 hover:border-sky-500 dark:hover:border-sky-500 transition-colors bg-gray-50 dark:bg-gray-700"
            >
              Write something...?
            </button>
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Images"
              >
                <FiImage className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Video"
              >
                <FiVideo className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Poll"
              >
                <FiBarChart2 className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Attachment"
              >
                <FiPaperclip className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Create New Post
          </h3>
          <button
            type="button"
            onClick={() => {
              if (typeof onClose === "function") return onClose();
              setShowForm(false);
            }}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        <Input
          label="Title"
          placeholder="Enter post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Requirement
          </label>
          <textarea
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder="Enter requirement"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter detailed description"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            required
          />
        </div>

        {/* INFO: Show user that unlock price is fixed */}
        <div className="p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Note:</span> All posts have a fixed
            unlock price of{" "}
            <span className="font-bold text-sky-600 dark:text-sky-400">
              ₹2000
            </span>
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (typeof onClose === "function") return onClose();
              setShowForm(false);
            }}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createPostMutation.isPending}
            className="flex-1 bg-sky-500 hover:bg-sky-600"
          >
            {createPostMutation.isPending ? "Posting..." : "Post"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
