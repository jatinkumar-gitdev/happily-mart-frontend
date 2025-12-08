import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHeart,
  FiShare2,
  FiLock,
  FiUnlock,
  FiStar,
  FiChevronRight,
} from "react-icons/fi";

import { FaOpencart , FaEye} from "react-icons/fa6";
import { postService } from "../../services/post.service";
import { subscriptionService } from "../../services/subscription.service";
import { useAuthStore } from "../../store/authStore";
import PaymentModal from "../payment/PaymentModal";
import CommentsSection from "./CommentsSection";
import ImageGalleryModal from "../ui/ImageGalleryModal";
import { showError, showSuccess, showInfo } from "../../utils/toast";
import { formatRelativeTime, formatDetailedDate } from "../../utils/timeUtils";
import DealStatusTag from "../deal/DealStatusTag";

const PostCard = ({ post: initialPost, isBlurred = false, onUnlockClick, viewMode = "list" }) => {
  const [showComments, setShowComments] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [post, setPost] = useState(initialPost);
  const { isAuthenticated, user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  if (!post) {
    return null;
  }

  const isUnlocked = post.isUnlocked || false;
  const isOwnPost = post.isOwnPost || false;
  const authorUnavailable = !post.author;
  const isLiked = Array.isArray(post.likes)
    ? post.likes.some((like) => {
        const likeId =
          typeof like === "object" && like !== null ? like.toString() : like;
        return likeId === user?._id?.toString();
      })
    : false;
  const isFavorited = Array.isArray(post.favorites)
    ? post.favorites.some((fav) => {
        const favId =
          typeof fav === "object" && fav !== null ? fav.toString() : fav;
        return favId === user?._id?.toString();
      })
    : false;

  const likeMutation = useMutation({
    mutationFn: () => postService.likePost(post._id),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(["posts"]);
      
      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(["posts"]);
      

      setPost(prevPost => ({
        ...prevPost,
        likes: isLiked 
          ? prevPost.likes.filter(id => id !== user._id) 
          : [...(prevPost.likes || []), user._id],
      }));
      
      
      return { previousPosts };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["posts"]);
      if (data?.isLiked) {
        showSuccess("Post liked successfully!");
      } else {
        showSuccess("Like removed successfully!");
      }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      setPost(initialPost);
      showError(error.response?.data?.message || "Failed to like post");
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: () => postService.favoritePost(post._id),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(["posts"]);
      await queryClient.cancelQueries(["favoritePosts"]);
      
      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(["posts"]);
      
      // Optimistically update the UI
      setPost(prevPost => ({
        ...prevPost,
        favorites: isFavorited 
          ? prevPost.favorites.filter(id => id !== user._id) 
          : [...(prevPost.favorites || []), user._id],
      }));
      
      // Return context with the previous value
      return { previousPosts };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["posts"]);
      queryClient.invalidateQueries(["favoritePosts"]);
      if (data?.isFavorited) {
        showSuccess("Post added to favorites!");
      } else {
        showSuccess("Post removed from favorites!");
      }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      setPost(initialPost);
      showError(error.response?.data?.message || "Failed to favorite post");
    },
  });

  const shareMutation = useMutation({
    mutationFn: () => postService.sharePost(post._id),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["posts"]);
      showSuccess("Post shared successfully!");
    },
    onError: (error) => {
      showError(error.response?.data?.message || "Failed to share post");
    },
  });

  const handleUnlock = async () => {
    if (!isAuthenticated) {
      onUnlockClick?.();
      return;
    }
    
    // For own posts, they should always be unlocked on the backend
    // This is just a safeguard check
    if (isOwnPost) {
      showInfo(
        "You created this requirement, so all details are already visible."
      );
      return;
    }
    
    if (authorUnavailable) {
      showError("This post's owner is no longer available.");
      return;
    }
    
    // For other users' posts, proceed with unlock process
    if (post.creditCost > 0 && !isUnlocked) {
      try {
        // Check user's subscription status and credits
        const subscriptionData = await subscriptionService.getMySubscription();
        const unlockCredits = subscriptionData?.subscription?.unlockCredits || 0;
        
        // Check if user has enough credits
        if (unlockCredits < post.creditCost) {
          showError(
            `Insufficient unlock credits! You have ${unlockCredits} credit${unlockCredits !== 1 ? 's' : ''}, but need ${post.creditCost} credit${post.creditCost !== 1 ? 's' : ''}.`
          );
          showInfo("Visit the Subscription page to purchase more credits!");
          return;
        }
        
        // Proceed with unlock
        const response = await postService.unlockPost(post._id);
        showSuccess(response.message || "Post unlocked successfully!");
        
        // Update user credits in auth store
        if (response.remainingUnlockCredits !== undefined) {
          updateUser({
            unlockCredits: response.remainingUnlockCredits,
            credits: response.remainingCredits,
          });
        }
        
        // Update the post with unlocked data
        // Make sure we're setting all the necessary properties
        setPost({ 
          ...post, 
          ...response.post, 
          isUnlocked: true,
          // Ensure isOwnPost remains consistent
          isOwnPost: post.isOwnPost
        });
        
        // Invalidate relevant queries to update UI
        queryClient.invalidateQueries(["posts"]);
        queryClient.invalidateQueries(["mySubscription"]);
        queryClient.invalidateQueries(["profile"]);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to unlock post";
        showError(errorMessage);
        
        // Provide helpful guidance for common error cases
        if (
          errorMessage.includes("credit") ||
          errorMessage.includes("subscription") ||
          errorMessage.includes("expired")
        ) {
          showInfo("Visit the Subscription page to get more credits or renew your subscription!");
        } else if (errorMessage.includes("own post")) {
          showInfo("You cannot unlock your own post as it's already unlocked for you.");
        }
      }
    }
  };

  const mapPostStatusToTag = (postStatus) => {
    const statusMap = {
      Available: "Contacted",
      "In Progress": "Ongoing",
      Completed: "Success",
      Cancelled: "Closed",
    };
    return statusMap[postStatus] || "Contacted";
  };

  const handleLike = () => {
    if (!isAuthenticated) {
      onUnlockClick?.();
      return;
    }
    likeMutation.mutate();
  };

  const handleFavorite = () => {
    if (!isAuthenticated) {
      onUnlockClick?.();
      return;
    }
    favoriteMutation.mutate();
  };

  const handleShare = () => {
    if (!isAuthenticated) {
      onUnlockClick?.();
      return;
    }
    shareMutation.mutate();
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.requirement,
        url: window.location.href,
      });
    }
  };

  const handlePaymentSuccess = (updatedPost) => {
    if (updatedPost) {
      setPost(updatedPost);
    } else {
      setPost((prev) => ({ ...prev, isUnlocked: true }));
    }
    showSuccess("Post unlocked! Contact details are now visible.");
    
    // Invalidate relevant queries to update UI across the app
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    queryClient.invalidateQueries({ queryKey: ["paymentHistory"] });
    queryClient.invalidateQueries({ queryKey: ["mySubscription"] });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    
    setShowPaymentModal(false);
  };

  return (
    <>
      <motion.div
        id={`post-${post._id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6 transition-all duration-300 flex flex-col h-full ${
          isBlurred && !isUnlocked ? "post-blurred" : ""
        } ${viewMode === "grid" ? "h-full" : ""}`}
      >
        {/* Animated Background Illustration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5 dark:opacity-10">
          <svg
            className="absolute w-full h-full"
            viewBox="0 0 800 600"
            preserveAspectRatio="xMidYMid slice"
          >
            <motion.circle
              cx="100"
              cy="100"
              r="80"
              fill="currentColor"
              className="text-sky-400"
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 30, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.circle
              cx="700"
              cy="150"
              r="120"
              fill="currentColor"
              className="text-purple-400"
              animate={{
                scale: [1, 1.3, 1],
                x: [0, -40, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.path
              d="M 200 400 Q 400 300 600 450"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-sky-300"
              animate={{
                strokeOpacity: [0.3, 0.8, 0.3],
                strokeWidth: [3, 4, 3],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.rect
              x="50"
              y="450"
              width="100"
              height="100"
              rx="20"
              fill="currentColor"
              className="text-indigo-400"
              animate={{
                rotate: [0, 15, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </svg>
        </div>

        {/* Header */}
        <motion.div
          className="relative p-4 border-b border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className={`flex flex-row justify-between items-center gap-3 ${viewMode === "grid" ? "flex-col items-start" : ""}`}>
            <div>
              <motion.h3
                className={`font-bold text-gray-800 dark:text-white ${viewMode === "grid" ? "text-base" : "text-base sm:text-xl"}`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {post.title}
              </motion.h3>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span title={formatDetailedDate(post.createdAt)}>
                  {formatRelativeTime(post.createdAt)}
                </span>
              </div>
            </div>
            <motion.div className="flex items-center gap-2 rounded-full py-2  bg-gradient-to-r from-sky-600 via-sky-700 to-[--button-bg]">
              <div className="text-white text-center flex items-center gap-2 text-sm"></div>

              <div className="flex gap-2  items-center ">
                <img
                  src={post.author?.avatar || "/default-avatar.png"}
                  alt={post.author?.name || "Author avatar"}
                  className="w-8 h-8 object-contain"
                />
                <p className={`text-base text-white font-semibold tracking-wide truncate ${viewMode === "grid" ? "max-w-[100px]" : "pr-4"}`}>
                  {authorUnavailable ? "Unavailable Author" : post.author?.name}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Deal Status Tag */}
        {post.dealStatus && post.dealStatus !== "Available" && (
          <div className="absolute top-4 right-4 z-20">
            <DealStatusTag 
              status={mapPostStatusToTag(post.dealStatus)} 
              size="sm"
              className="shadow-md"
            />
          </div>
        )}

        {/* Content */}
        <div className="relative p-4 flex-grow" style={{ minHeight: '1px' }}>
          {/* Image and Content Layout */}
          <div className={`flex ${viewMode === "grid" ? "flex-col" : "flex-col md:flex-row"} gap-4 lg:gap-6 mb-4`}>
            {/* Main image on the left */}
            {post.images && post.images.length > 0 && (
              <div className={`${viewMode === "grid" ? "w-full" : "md:w-[30%]"} flex-shrink-0 relative group cursor-pointer`} onClick={() => setIsImageModalOpen(true)}>
                <div className={`${viewMode === "grid" ? "h-48" : "lg:h-56 h-full"} rounded-xl overflow-hidden relative`}>
                  <img
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${post.images[0]}`}
                    alt={`Main post image`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.png';
                    }}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl">
                      <FaEye className="text-2xl text-black/80" />
                      <span className="text-black/80 font-semibold text-sm">Preview</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Content on the right */}
            <div className={viewMode === "grid" ? "w-full" : "md:w-[70%]"}>
              <motion.div
                className="mb-4 flex lg:items-center flex-col lg:flex-row lg:gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h4 className="font-semibold tracking-wide text-gray-700 dark:text-gray-300 text-lg">
                  Requirement:
                </h4>
                <p className={`text-gray-600 dark:text-gray-400 ${viewMode === "grid" ? "text-sm line-clamp-2" : "text-base"}`}>
                  {post.requirement}
                </p>
              </motion.div>

              <motion.div
                className="mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h4 className="font-semibold tracking-wide text-gray-700 dark:text-gray-300 text-lg">
                  Description:
                </h4>
                <div className={`text-gray-600 dark:text-gray-400 ${viewMode === "grid" ? "text-sm" : "text-base"}`}>
                  {isUnlocked ? (
                    <div className="whitespace-pre-line">
                      {post.description}
                    </div>
                  ) : (
                    <p>
                      {post.description?.substring(0, viewMode === "grid" ? 80 : 100) + "..."}
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Unlock Section - Only show for OTHER users' posts that are not unlocked */}
          {!isOwnPost && !isUnlocked && !authorUnavailable && post.creditCost > 0 && (
            <motion.div
              className="mb-4 p-4 sm:p-5 bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-sky-200 dark:border-sky-800"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className={`flex flex-col ${viewMode === "grid" ? "sm:flex-col gap-3" : "sm:flex-row"} items-start sm:items-center justify-between gap-3`}>
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <FiLock className="text-sky-600 dark:text-sky-400 text-xl" />
                  </motion.div>
                  <span className={`tracking-wide text-gray-700 dark:text-gray-300 ${viewMode === "grid" ? "text-sm" : "text-base"}`}>
                    Unlock to view full details and contact information
                  </span>
                </div>
                <motion.button
                  onClick={handleUnlock}
                  onHoverStart={() => setIsHovering(true)}
                  onHoverEnd={() => setIsHovering(false)}
                  className={`relative px-5 py-2.5 rounded-full font-semibold text-sm transition-all overflow-hidden shadow-lg hover:shadow-xl flex items-center justify-center min-w-[180px] ${
                    authorUnavailable || isOwnPost
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-sky-500 to-[--button-bg] hover:from-sky-600 hover:to-indigo-700 text-white"
                  } ${viewMode === "grid" ? "w-full" : ""}`}
                  whileTap={{
                    scale: authorUnavailable || isOwnPost ? 1 : 0.95,
                  }}
                  disabled={authorUnavailable || isOwnPost}
                >
                  <motion.div
                    className="flex items-center gap-2"
                    animate={
                      isHovering
                        ? { opacity: 0, scale: 0.8 }
                        : { opacity: 1, scale: 1 }
                    }
                    transition={{ duration: 0.2 }}
                  >
                    <FiUnlock />
                    <span>
                      Unlock ({post.creditCost || 1} Credit
                      {(post.creditCost || 1) > 1 ? "s" : ""})
                    </span>
                  </motion.div>

                  <motion.div
                    className={`hidden sm:flex absolute inset-0 items-center justify-center gap-1 ${viewMode === "grid" ? "hidden" : ""}`}
                    initial={{ opacity: 0 }}
                    animate={isHovering ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {[0, 1, 2].map((index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={
                          isHovering
                            ? {
                                x: [0, 30],
                                opacity: [0, 1, 0],
                              }
                            : { x: -20, opacity: 0 }
                        }
                        transition={{
                          duration: 1.5,
                          repeat: isHovering ? Infinity : 0,
                          delay: index * 0.2,
                          ease: "easeInOut",
                        }}
                      >
                        <FiChevronRight className="text-white text-xl" />
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Already Unlocked Message - Show for unlocked posts that aren't owned by the user */}
          {isUnlocked && !isOwnPost && (
            <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-700 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <FiUnlock className="text-emerald-600 dark:text-emerald-400" />
                <span>You've unlocked this post. Contact details are now visible.</span>
              </div>
            </div>
          )}

          {authorUnavailable && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
              This post's owner is no longer available. Unlocking has been
              disabled.
            </div>
          )}

          {isOwnPost && !authorUnavailable && (
            <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-700 dark:text-emerald-300">
              This is your post. Others need to unlock it to view contact details.
            </div>
          )}

         <AnimatePresence>
            {isUnlocked && !isOwnPost && !authorUnavailable && post.author && (
              <motion.div
                className="mb-4 p-4 sm:p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.h4
                  className="font-semibold text-green-800 dark:text-green-400 mb-3 flex items-center gap-2"
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                >
                  <FiUnlock />
                  Contact Details:
                </motion.h4>
                <div className="space-y-2 text-sm">
                  {post.author.email && (
                    <motion.p
                      className="text-gray-700 dark:text-gray-300"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <span className="font-medium">Email:</span>{" "}
                      {post.author.email}
                    </motion.p>
                  )}
                  {post.author.phone && (
                    <motion.p
                      className="text-gray-700 dark:text-gray-300"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span className="font-medium">Phone:</span>{" "}
                      {post.author.phone}
                    </motion.p>
                  )}
                  {post.author.companyName && (
                    <motion.p
                      className="text-gray-700 dark:text-gray-300"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span className="font-medium">Company:</span>{" "}
                      {post.author.companyName}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Engagement */}
        <motion.div
          className="relative p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between mt-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className={`flex items-center gap-4 sm:gap-6 flex-wrap ${viewMode === "grid" ? "gap-2" : ""}`}>
            <motion.button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors ${
                isLiked
                  ? "text-red-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-red-500"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <FiHeart
                  className={`text-xl ${isLiked ? "fill-current" : ""}`}
                />
              </motion.div>
              <span className={`text-sm font-medium ${viewMode === "grid" ? "text-xs" : ""}`}>
                {post.likes?.length || 0}
              </span>
            </motion.button>

            <motion.button
              onClick={handleFavorite}
              className={`flex items-center gap-2 transition-colors ${
                isFavorited
                  ? "text-yellow-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-yellow-500"
              }`}
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={isFavorited ? { rotate: [0, -15, 15, -15, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                <FaOpencart
                  className={`text-xl ${isFavorited ? "fill-current" : ""}`}
                />
              </motion.div>
              <span className={`text-sm font-medium ${viewMode === "grid" ? "text-xs" : ""}`}>
                {post.favorites?.length || 0}
              </span>
            </motion.button>

            <motion.button
              onClick={handleShare}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-sky-500 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9, rotate: -15 }}
            >
              <FiShare2 className="text-xl" />
              <span className={`text-sm font-medium ${viewMode === "grid" ? "text-xs" : ""}`}>{post.shares || 0}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CommentsSection
                postId={post._id}
                isAuthenticated={isAuthenticated}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          post={post}
          onSuccess={handlePaymentSuccess}
        />
      )}
      
      <ImageGalleryModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        post={post}
        isUnlocked={isUnlocked}
        authorUnavailable={authorUnavailable}
        onUnlock={handleUnlock}
      />
    </>
  );
};

export default PostCard;