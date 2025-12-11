import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FiCalendar, FiAlertCircle, FiCheckCircle, FiRefreshCw } from "react-icons/fi";
import { GiTwoCoins } from "react-icons/gi";
import { postService } from "../../services/post.service";
import { subscriptionService } from "../../services/subscription.service";
import useSocket from "../../hooks/useSocket";
import { showError, showSuccess } from "../../utils/toast";

const PostValidityManager = ({ post: initialPost }) => {
  const [post, setPost] = useState(initialPost);
  const [showValidityModal, setShowValidityModal] = useState(false);
  const [selectedValidity, setSelectedValidity] = useState(post.validityPeriod || 7);
  const [validityOptions, setValidityOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { on, off } = useSocket();

  // Check if post is expired
  const isExpired = post.expiresAt && new Date() > new Date(post.expiresAt);

  // Update local post when initialPost changes
  useEffect(() => {
    setPost(initialPost);
    setSelectedValidity(initialPost.validityPeriod || 7);
  }, [initialPost]);

  // Fetch validity options when modal opens (if post is expired)
  useEffect(() => {
    if (showValidityModal && isExpired && post._id) {
      setLoading(true);
      postService.getValidityOptions(post._id)
        .then((data) => {
          setValidityOptions(data.reviveOptions || []);
        })
        .catch((error) => {
          console.error("Failed to fetch validity options:", error);
          // Fallback to default options with estimated costs
          setValidityOptions([
            { days: 7, cost: 1 },
            { days: 15, cost: 3 },
            { days: 30, cost: 5 }
          ]);
        })
        .finally(() => setLoading(false));
    }
  }, [showValidityModal, isExpired, post._id]);

  // Socket listeners for real-time validity updates
  useEffect(() => {
    const handleValidityUpdated = (data) => {
      if (data.postId === post._id) {
        setPost((prev) => ({
          ...prev,
          validityPeriod: data.validityPeriod,
          expiresAt: data.expiresAt,
          postStatus: data.postStatus,
          isActive: data.isActive,
          dealResult: data.dealResult,
        }));
        setShowValidityModal(false);
        showSuccess("Post validity updated successfully!");
      }
    };

    const handlePostRevived = (data) => {
      if (data.postId === post._id) {
        setPost((prev) => ({
          ...prev,
          validityPeriod: data.validityPeriod,
          expiresAt: data.expiresAt,
          postStatus: "Active",
          isActive: true,
          isExpired: false,
        }));
        showSuccess(data.message);
      }
    };

    on("post:validityUpdated", handleValidityUpdated);
    on("post:revived", handlePostRevived);

    return () => {
      off("post:validityUpdated", handleValidityUpdated);
      off("post:revived", handlePostRevived);
    };
  }, [post._id, on, off]);

  // Mutation for updating post validity
  const updateValidityMutation = useMutation({
    mutationFn: ({ postId, validityPeriod }) =>
      postService.updatePostValidity(postId, validityPeriod),
    onSuccess: (data) => {
      showSuccess(data.message);
      queryClient.setQueryData(["posts", true], (oldData) => {
        if (!oldData) return oldData;
        
        const newData = {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            posts: page.posts.map(p => 
              p._id === post._id ? { ...p, ...data.post } : p
            ),
          })),
        };
        
        return newData;
      });
      setShowValidityModal(false);
    },
    onError: (error) => {
      showError(error.response?.data?.message || "Failed to update post validity");
    },
  });

  const handleUpdateValidity = () => {
    updateValidityMutation.mutate({ 
      postId: post._id, 
      validityPeriod: selectedValidity 
    });
  };

  // Get cost for selected validity from options
  const selectedCost = validityOptions.find(opt => opt.days === selectedValidity)?.cost || Math.ceil(selectedValidity / 7);

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <FiCalendar className="text-sky-500" />
            Post Validity
          </h3>
          <button
            onClick={() => setShowValidityModal(true)}
            className="text-sm text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 font-medium"
          >
            Change
          </button>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Current Period:</span>
            <span className="font-medium text-gray-800 dark:text-white">{post.validityPeriod || 7} days</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Expires On:</span>
            <span className="font-medium text-gray-800 dark:text-white">
              {post.expiresAt ? new Date(post.expiresAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          
          {isExpired && (
            <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-300 text-sm">
              <FiAlertCircle className="flex-shrink-0" />
              <span>Post has expired - Click "Change" to revive</span>
            </div>
          )}
        </div>
      </div>

      {/* Validity Change Modal */}
      {showValidityModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[9999] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isExpired ? "Revive Post" : "Change Validity"}
                </h3>
                <button
                  onClick={() => setShowValidityModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {isExpired 
                  ? "Select a duration to revive your post. Extending will deduct credits from your account."
                  : "Select a new validity period for your post."
                }
              </p>
              
              {loading && (
                <div className="text-center py-4 text-gray-500">Loading options...</div>
              )}
              
              {!loading && (
                <div className="space-y-4 mb-6">
                  {[7, 15, 30].map((days) => {
                    const option = validityOptions.find(opt => opt.days === days);
                    const cost = option?.cost || Math.ceil(days / 7);
                    return (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setSelectedValidity(days)}
                        className={`w-full p-4 rounded-lg border text-left transition-colors ${
                          selectedValidity === days
                            ? "border-sky-500 bg-sky-50 dark:bg-sky-900/30"
                            : "border-gray-300 dark:border-gray-600 hover:border-sky-300 dark:hover:border-sky-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {days} Days
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {days === 7 ? "Standard" : days === 15 ? "Extended" : "Premium"}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1 text-sm font-semibold text-amber-600 dark:text-amber-400">
                              <GiTwoCoins className="text-base" />
                              {cost} {cost === 1 ? "credit" : "credits"}
                            </div>
                            {selectedValidity === days && (
                              <FiCheckCircle className="text-sky-500 text-xl" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              
              {isExpired && (
                <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-700 dark:text-amber-300 text-sm">
                  <FiAlertCircle className="inline mr-2" />
                  Reviving will deduct {selectedCost} credit{selectedCost !== 1 ? 's' : ''} from your account.
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowValidityModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateValidity}
                  disabled={updateValidityMutation.isPending}
                  className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {updateValidityMutation.isPending ? "Updating..." : isExpired ? "Revive" : "Update"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default PostValidityManager;