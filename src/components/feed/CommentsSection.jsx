import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiSend, FiUser } from "react-icons/fi";
import { postService } from "../../services/post.service";
import { useAuthStore } from "../../store/authStore";
import { getAvatarUrl } from "../../utils/avatarUtils";
import { showError, showSuccess } from "../../utils/toast";

const CommentsSection = ({ postId, isAuthenticated }) => {
  const [commentText, setCommentText] = useState("");
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: commentsData, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => postService.getComments(postId),
    enabled: !!postId,
  });

  const addCommentMutation = useMutation({
    mutationFn: (text) => postService.addComment(postId, text),
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", postId]);
      queryClient.invalidateQueries(["posts", true]);
      setCommentText("");
      showSuccess("Comment added successfully!");
    },
    onError: (error) => {
      showError(error.response?.data?.message || "Failed to add comment");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim() && isAuthenticated) {
      addCommentMutation.mutate(commentText.trim());
    }
  };

  const comments = commentsData?.comments || [];

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
      <h4 className="font-medium text-gray-800 dark:text-white mb-4">
        Comments ({comments.length})
      </h4>

      {/* Comments List */}
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {isLoading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading comments...
          </p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No comments yet
          </p>
        ) : (
          comments.map((comment, index) => (
            <div key={index} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {comment.user?.avatar ? (
                  <img
                    src={getAvatarUrl(comment.user.avatar)}
                    alt={comment.user.name}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextElementSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <span
                  className={`text-white text-xs font-semibold ${
                    comment.user?.avatar
                      ? "hidden"
                      : "flex items-center justify-center w-full h-full"
                  }`}
                >
                  {comment.user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="font-medium text-sm text-gray-800 dark:text-white">
                    {comment.user?.name || "Anonymous"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {comment.text}
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user?.avatar ? (
              <img
                src={getAvatarUrl(user.avatar)}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextElementSibling.style.display = "flex";
                }}
              />
            ) : null}
            <span
              className={`text-white text-xs font-semibold ${
                user?.avatar
                  ? "hidden"
                  : "flex items-center justify-center w-full h-full"
              }`}
            >
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || addCommentMutation.isPending}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSend />
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
          Please login to comment
        </p>
      )}
    </div>
  );
};

export default CommentsSection;
