import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHeart,
  FiShare2,
  FiLock,
  FiUnlock,
  FiChevronRight,
  FiAward,
  FiUser,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import { TbRefreshAlert } from "react-icons/tb";
import { FaOpencart , FaEye} from "react-icons/fa6";
import { postService } from "../../services/post.service";
import { subscriptionService } from "../../services/subscription.service";
import { useAuthStore } from "../../store/authStore";
import useSocket from "../../hooks/useSocket";
import PaymentModal from "../payment/PaymentModal";
import CommentsSection from "./CommentsSection";
import ImageGalleryModal from "../ui/ImageGalleryModal";
import { showError, showSuccess, showInfo } from "../../utils/toast";
import EditPostModal from "./EditPostModal";
import PostValidityManager from "../deal/PostValidityManager";
import DeleteConfirmationModal from "../modals/DeleteConfirmationModal";
import { formatDetailedDate, formatRelativeTime } from "../../utils/timeUtils";
import { getAvatarUrl } from "../../utils/avatarUtils";

const PostCard = ({ post: initialPost, isBlurred = false, onUnlockClick, viewMode = "list" }) => {
  const [showComments, setShowComments] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [post, setPost] = useState(initialPost);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { isAuthenticated, user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const { on, off } = useSocket();

  const isUnlocked = post.isUnlocked || false;
  const isOwnPost = post.isOwnPost || false;
  const isExpired = post.postStatus === "Expired" || post.isExpired || new Date() > new Date(post.expiresAt);
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

  const unlockedDetailCount = post.unlockedDetailCount || 0;
  const contactCount = post.contactCount || 0;
  const badgeLevel = post.badgeLevel || 0;

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  // Socket listeners for real-time updates
  useEffect(() => {
    const handleUnlockedDetailCountUpdate = (data) => {
      if (data.postId === initialPost._id && isOwnPost) {
        setPost((prev) => ({
          ...prev,
          unlockedDetailCount: data.unlockedDetailCount,
        }));
      }
    };

    const handleContactCountUpdate = (data) => {
      if (data.postId === initialPost._id && isOwnPost) {
        setPost((prev) => ({
          ...prev,
          contactCount: data.contactCount,
          badgeLevel: data.badgeLevel || prev.badgeLevel,
        }));
        showSuccess(`New prospect unlocked your post! Total: ${data.contactCount}`);
      }
    };

    const handleDealStatusChanged = (data) => {
      if (data.postId === initialPost._id) {
        setPost((prev) => ({
          ...prev,
          dealToggleStatus: data.dealToggleStatus,
          dealResult: data.dealResult,
          postStatus: data.postStatus,
          isActive: data.isActive,
        }));
        if (!isOwnPost) {
          showInfo("A post you viewed has been updated");
        }
      }
    };

    const handleValidityUpdated = (data) => {
      if (data.postId === initialPost._id) {
        setPost((prev) => ({
          ...prev,
          validityPeriod: data.validityPeriod,
          expiresAt: data.expiresAt,
          postStatus: data.postStatus,
          isActive: data.isActive,
          dealResult: data.dealResult,
        }));
      }
    };

    const handlePostEdited = (data) => {
      if (data.postId === initialPost._id) {
        setPost((prev) => ({
          ...prev,
          title: data.title,
          requirement: data.requirement,
          description: data.description,
          category: data.category,
          subcategory: data.subcategory,
          creditCost: data.creditCost,
        }));
        if (isOwnPost) {
          showSuccess("Your post has been updated");
        }
      }
    };

    const handlePostDeleted = (data) => {
      if (data.postId === initialPost._id) {
        setPost((prev) => ({
          ...prev,
          isActive: false,
          postStatus: "Provisional",
        }));
        if (!isOwnPost) {
          showInfo("A post you viewed has been deleted");
        }
      }
    };

    on("post:unlockedDetailCountUpdated", handleUnlockedDetailCountUpdate);
    on("post:contactCountUpdated", handleContactCountUpdate);
    on("post:dealStatusChanged", handleDealStatusChanged);
    on("post:validityUpdated", handleValidityUpdated);
    on("post:edited", handlePostEdited);
    on("post:deleted", handlePostDeleted);

    return () => {
      off("post:unlockedDetailCountUpdated", handleUnlockedDetailCountUpdate);
      off("post:contactCountUpdated", handleContactCountUpdate);
      off("post:dealStatusChanged", handleDealStatusChanged);
      off("post:validityUpdated", handleValidityUpdated);
      off("post:edited", handlePostEdited);
      off("post:deleted", handlePostDeleted);
    };
  }, [initialPost._id, on, off, isOwnPost]);

  // Increment view count when a prospect views an unlocked post
  useEffect(() => {
    const incrementViewCount = async () => {
      // Only increment for prospects (not owners) viewing unlocked posts
      if (isAuthenticated && !post.isOwnPost && post.isUnlocked && post._id) {
        try {
          const response = await postService.incrementViewCount(post._id);
          if (response.success) {
            // Update the post with the new view count
            setPost(prevPost => ({
              ...prevPost,
              unlockedDetailCount: response.unlockedDetailCount
            }));
          }
        } catch (error) {
          console.error("Failed to increment unlocked detail count:", error);
        }
      }
    };

    incrementViewCount();
  }, [isAuthenticated, post.isOwnPost, post.isUnlocked, post._id]);

  if (!post) {
    return null;
  }

  const likeMutation = useMutation({
    mutationFn: () => postService.likePost(post._id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      
      const previousPosts = queryClient.getQueryData({ queryKey: ["posts"] });

      setPost(prevPost => ({
        ...prevPost,
        likes: isLiked 
          ? prevPost.likes.filter(id => id !== user._id) 
          : [...(prevPost.likes || []), user._id],
      }));
      
      return { previousPosts };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      if (data?.isLiked) {
        showSuccess("Post liked successfully!");
      } else {
        showSuccess("Like removed successfully!");
      }
    },
    onError: (error, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData({ queryKey: ["posts"] }, context.previousPosts);
      }
      setPost(initialPost);
      showError(error.response?.data?.message || "Failed to like post");
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: () => postService.favoritePost(post._id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["favoritePosts"] });
      
      const previousPosts = queryClient.getQueryData({ queryKey: ["posts"] });
      
      setPost(prevPost => ({
        ...prevPost,
        favorites: isFavorited 
          ? prevPost.favorites.filter(id => id !== user._id) 
          : [...(prevPost.favorites || []), user._id],
      }));
      
      return { previousPosts };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["favoritePosts"] });
      if (data?.isFavorited) {
        showSuccess("Post added to favorites!");
      } else {
        showSuccess("Post removed from favorites!");
      }
    },
    onError: (error, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData({ queryKey: ["posts"] }, context.previousPosts);
      }
      setPost(initialPost);
      showError(error.response?.data?.message || "Failed to favorite post");
    },
  });

  const shareMutation = useMutation({
    mutationFn: () => postService.sharePost(post._id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      showSuccess("Post shared successfully!");
    },
    onError: (error) => {
      showError(error.response?.data?.message || "Failed to share post");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ reasons } = {}) => postService.deletePost(post._id, { deletionReasons: reasons || [] }),
    onSuccess: (data) => {
      showSuccess("Post deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
    },
    onError: (error) => {
      showError(error.response?.data?.message || "Failed to delete post");
    },
  });

  const handleDelete = async (reasons) => {
    deleteMutation.mutate({ reasons });
    setShowDeleteModal(false);
  };

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

    // Check if post is expired or deal is won/failed
    if (post.postStatus === "Expired" || post.isExpired) {
      showError("This post has expired and cannot be unlocked. Contact the creator for revival.");
      return;
    }

    if (post.dealResult === "Won" || post.dealResult === "Failed") {
      showError("This post's deal has been completed and it cannot be unlocked further.");
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

  // Get badge text based on level
  const getBadgeText = (level) => {
    switch (level) {
      case 1: return "10+";
      case 2: return "20+";
      case 3: return "50+";
      case 4: return "100+";
      case 5: return "150+";
      default: return "";
    }
  };

  return (
    <>
      <motion.div
        id={`post-${post._id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isExpired ? 0.5 : 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6 transition-all duration-300 flex flex-col h-full ${
          isBlurred && !isUnlocked ? "post-blurred" : ""
        } ${viewMode === "grid" ? "h-full" : ""} ${isExpired ? "opacity-50 grayscale" : ""}`}
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
          <div className={`flex flex-row justify-between items-center gap-3 ${viewMode === "grid" ? "flex-row items-start" : ""}`}>
            <div className={`flex gap-2 ${viewMode === "grid" ? "flex-row items-start" : "flex-col items-start"}`}>
            <div className="flex gap-2 items-center">
              <motion.h3
                className={`font-bold text-gray-800 dark:text-white ${viewMode === "grid" ? "text-base" : "text-base sm:text-xl"}`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {post.title}
              </motion.h3>
              <div>
                 {post.dealResult && ['Won', 'Failed'].includes(post.dealResult) && (
                   <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-lg ${post.dealResult === 'Won' ? 'bg-gradient-to-r from-[--primary] to-[--button-bg]' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
                    <span className="text-lg">{post.dealResult === 'Won' ? '✓' : '✕'}</span>
                   <span>Deal {post.dealResult}</span>
                   </div>
                  )}
              </div>
            </div>
              <div>
               {isOwnPost && contactCount > 0 && (
                 <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                 <FaEye className="text-xs" />
                 <span>{contactCount} are contacted</span>
             </div>
                )}
              </div>
            </div>
            <motion.div className="flex items-center gap-2 rounded-full py-2  bg-gradient-to-r from-sky-600 via-sky-700 to-[--button-bg]">
              <div className="text-white text-center flex items-center gap-2 text-sm"></div>
              <div className="flex gap-2 items-center ">
                <img
                  src={getAvatarUrl(post.author?.avatar) || "/default-avatar.png"}
                  alt={post.author?.name || "Author avatar"}
                  className="w-8 h-8 object-contain"
                />
               <div> 
                <p className={`text-base text-white font-semibold tracking-wide truncate ${viewMode === "grid" ? "max-w-[100px]" : "pr-1.5"}`}>
                  {authorUnavailable ? "Unavailable Author" : post.author?.name}
                </p>
                <div>  {isOwnPost && (
                  <div className="flex items-center gap-1 text-xs text-white font-bold">
                  <span>{post.isCreator ? "Creator" : "Prospect"}</span>
                 </div>
                 )}
                 </div>
               </div>
               
               {/* Edit and Delete buttons for creators */}
               {isOwnPost && (
                 <div className="flex gap-1 pr-2">
                   <button
                     onClick={() => setShowEditModal(true)}
                     className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                     title="Edit post"
                   >
                     <FiEdit className="text-white text-sm" />
                   </button>
                   <button
                     onClick={() => setShowDeleteModal(true)}
                     disabled={deleteMutation.isPending}
                     className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
                     title="Delete post"
                   >
                     <FiTrash2 className="text-white text-sm" />
                   </button>
                 </div>
               )}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Unlocked Detail Count Badge - Only visible to post owners */}
     
        
        {/* Badge for creators (moved to avoid overlap) */}
         {/* {isOwnPost && badgeLevel > 0 && (
          <div className="absolute top-4 left-32 z-20 flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            <FiAward className="text-xs" />
            <span>{getBadgeText(badgeLevel)}</span>
          </div>
        )} */}
       

        {/* Deal Result Badge - Shows Won/Failed status */}
        {/* {post.dealResult && ['Won', 'Failed'].includes(post.dealResult) && (
          <div className={`absolute top-4 right-4 z-20 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg ${post.dealResult === 'Won' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
            <span className="text-lg">{post.dealResult === 'Won' ? '✓' : '✕'}</span>
            <span>Deal {post.dealResult}</span>
          </div>
        )} */}

        {/* Content */}
        <div className="relative p-4 flex-grow" style={{ minHeight: '1px' }}>
          {/* Image and Content Layout */}
          <div className={`flex ${viewMode === "grid" ? "flex-col" : "flex-col md:flex-row"} gap-4 lg:gap-6 mb-4`}>
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

          {/* Unlock Section - Only show for OTHER users' posts that are not unlocked and not expired/won/failed */}
          {!isOwnPost && !isUnlocked && !authorUnavailable && post.creditCost > 0 && post.postStatus !== "Expired" && !post.isExpired && post.dealResult !== "Won" && post.dealResult !== "Failed" && (
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

          {(post.postStatus === "Expired" || post.isExpired) && !isOwnPost && (
            <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <TbRefreshAlert />
                <span>This post has expired. The creator can revive it to enable unlocking again.</span>
              </div>
            </div>
          )}

          {(post.dealResult === "Won" || post.dealResult === "Failed") && !isOwnPost && (
            <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <TbRefreshAlert />
                <span>This post's deal has been completed. Unlocking is no longer available.</span>
              </div>
            </div>
          )}

          {isOwnPost && !authorUnavailable && (
            <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-700 dark:text-emerald-300">
              This is your post. Others need to unlock it to view contact details.
            </div>
          )}

          {/* Post Validity Manager for creators */}
          {isOwnPost && !authorUnavailable && (
            <div className="mb-4">
              <PostValidityManager post={post} />
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
          <div>
             <div className="text-xs text-black">
                <span title={formatDetailedDate(post.createdAt)}>
                  {formatRelativeTime(post.createdAt)}
                </span>
              </div>
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
      
      {showEditModal && (
        <EditPostModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          post={post}
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

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        postTitle={post.title}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};

export default PostCard;