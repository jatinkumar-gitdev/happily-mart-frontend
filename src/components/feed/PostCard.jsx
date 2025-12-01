// import { useState } from "react";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   FiHeart,
//   FiMessageCircle,
//   FiShare2,
//   FiMoreVertical,
//   FiLock,
//   FiUnlock,
//   FiStar,
// } from "react-icons/fi";
// import { postService } from "../../services/post.service";
// import { useAuthStore } from "../../store/authStore";
// import PaymentModal from "../payment/PaymentModal";
// import CommentsSection from "./CommentsSection";

// const PostCard = ({ post, isBlurred = false, onUnlockClick }) => {
//   const [showComments, setShowComments] = useState(false);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const { isAuthenticated, user } = useAuthStore();
//   const queryClient = useQueryClient();

//   const isUnlocked = post.isUnlocked || false;
//   const isLiked = Array.isArray(post.likes)
//     ? post.likes.some((like) => {
//         const likeId =
//           typeof like === "object" && like !== null ? like.toString() : like;
//         return likeId === user?._id?.toString();
//       })
//     : false;
//   const isFavorited = Array.isArray(post.favorites)
//     ? post.favorites.some((fav) => {
//         const favId =
//           typeof fav === "object" && fav !== null ? fav.toString() : fav;
//         return favId === user?._id?.toString();
//       })
//     : false;

//   const likeMutation = useMutation({
//     mutationFn: () => postService.likePost(post._id),
//     onSuccess: () => {
//       queryClient.invalidateQueries(["posts"]);
//     },
//   });

//   const favoriteMutation = useMutation({
//     mutationFn: () => postService.favoritePost(post._id),
//     onSuccess: () => {
//       queryClient.invalidateQueries(["posts"]);
//       queryClient.invalidateQueries(["favoritePosts"]);
//     },
//   });

//   const shareMutation = useMutation({
//     mutationFn: () => postService.sharePost(post._id),
//     onSuccess: () => {
//       queryClient.invalidateQueries(["posts"]);
//     },
//   });

//   const handleUnlock = () => {
//     if (!isAuthenticated) {
//       onUnlockClick?.();
//       return;
//     }
//     if (post.unlockPrice > 0 && !isUnlocked) {
//       setShowPaymentModal(true);
//     }
//   };

//   const handleLike = () => {
//     if (!isAuthenticated) {
//       onUnlockClick?.();
//       return;
//     }
//     likeMutation.mutate();
//   };

//   const handleFavorite = () => {
//     if (!isAuthenticated) {
//       onUnlockClick?.();
//       return;
//     }
//     favoriteMutation.mutate();
//   };

//   const handleShare = () => {
//     if (!isAuthenticated) {
//       onUnlockClick?.();
//       return;
//     }
//     shareMutation.mutate();
//     if (navigator.share) {
//       navigator.share({
//         title: post.title,
//         text: post.requirement,
//         url: window.location.href,
//       });
//     }
//   };

//   const handlePaymentSuccess = () => {
//     queryClient.invalidateQueries(["posts"]);
//     setShowPaymentModal(false);
//   };

//   return (
//     <>
//       <div
//         className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6 ${
//           isBlurred && !isUnlocked ? "post-blurred" : ""
//         }`}
//       >
//         {/* Header */}
//         <div className="p-4 border-b border-gray-200 dark:border-gray-700">
//           <div className="">
//             <div className="flex justify-between items-center">
//               <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
//                 {post.title}
//               </h3>
//               <div className="flex items-center gap-2 mt-1 rounded-full py-2 px-6 bg-gradient-to-r from-[--primary] via-sky-700 to-[--button-bg] dark:bg-gray-700 w-max">
//                 <div className="text-white text-center flex items-center gap-2">
//                   <div className="font-semibold tracking-wide">Owner</div>-
//                 </div>
//                 <p className="text-sm text-white font-semibold tracking-wide dark:text-gray-400">
//                   {post.author?.name || "Anonymous"}
//                 </p>
//                 <div className="flex items-center gap-2">
//                   {post.author?.companyName && (
//                     <>
//                       <span className="text-white">|</span>
//                       <p className="text-sm text-white font-semibold tracking-wdie dark:text-gray-400">
//                         {post.author.companyName}
//                       </p>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//             {/* <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
//               <FiMoreVertical className="text-xl" />
//             </button> */}
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-4">
//           <div className="mb-3">
//             <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Requirement:
//             </h4>
//             <p className="text-gray-600 dark:text-gray-400">
//               {post.requirement}
//             </p>
//           </div>

//           <div className="mb-4">
//             <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Description:
//             </h4>
//             <p className="text-gray-600 dark:text-gray-400">
//               {isUnlocked
//                 ? post.description
//                 : post.description?.substring(0, 100) + "..."}
//             </p>
//           </div>

//           {/* Unlock Section */}
//           {!isUnlocked && post.unlockPrice > 0 && (
//             <div className="mb-4 p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <FiLock className="text-sky-600 dark:text-sky-400" />
//                   <span className="text-sm text-gray-700 dark:text-gray-300">
//                     Unlock to view full details and contact information
//                   </span>
//                 </div>
//                 <button
//                   onClick={handleUnlock}
//                   className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full font-semibold text-sm transition-colors flex items-center gap-2"
//                 >
//                   <FiUnlock />
//                   Unlock (₹{post.unlockPrice})
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Contact Details (if unlocked) */}
//           {isUnlocked && post.author && (
//             <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
//               <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">
//                 Contact Details:
//               </h4>
//               <div className="space-y-1 text-sm">
//                 <p className="text-gray-700 dark:text-gray-300">
//                   <span className="font-medium">Email:</span>{" "}
//                   {post.author.email}
//                 </p>
//                 {post.author.phone && (
//                   <p className="text-gray-700 dark:text-gray-300">
//                     <span className="font-medium">Phone:</span>{" "}
//                     {post.author.phone}
//                   </p>
//                 )}
//                 {post.author.companyName && (
//                   <p className="text-gray-700 dark:text-gray-300">
//                     <span className="font-medium">Company:</span>{" "}
//                     {post.author.companyName}
//                   </p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Engagement */}
//         <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
//           <div className="flex items-center gap-6">
//             <button
//               onClick={handleLike}
//               className={`flex items-center gap-2 transition-colors ${
//                 isLiked
//                   ? "text-red-500"
//                   : "text-gray-600 dark:text-gray-400 hover:text-red-500"
//               }`}
//             >
//               <FiHeart className={`text-xl ${isLiked ? "fill-current" : ""}`} />
//               <span className="text-sm font-medium">
//                 {post.likes?.length || 0}
//               </span>
//             </button>
//             {/* <button
//               onClick={() => setShowComments(!showComments)}
//               className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-sky-500 transition-colors"
//             >
//               <FiMessageCircle className="text-xl" />
//               <span className="text-sm font-medium">
//                 {Array.isArray(post.comments) ? post.comments.length : 0}
//               </span>
//             </button> */}
//             <button
//               onClick={handleFavorite}
//               className={`flex items-center gap-2 transition-colors ${
//                 isFavorited
//                   ? "text-yellow-500"
//                   : "text-gray-600 dark:text-gray-400 hover:text-yellow-500"
//               }`}
//             >
//               <FiStar
//                 className={`text-xl ${isFavorited ? "fill-current" : ""}`}
//               />
//               <span className="text-sm font-medium">
//                 {post.favorites?.length || 0}
//               </span>
//             </button>
//             <button
//               onClick={handleShare}
//               className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-sky-500 transition-colors"
//             >
//               <FiShare2 className="text-xl" />
//               <span className="text-sm font-medium">{post.shares || 0}</span>
//             </button>
//           </div>
//         </div>

//         {/* Comments Section */}
//         {showComments && (
//           <CommentsSection
//             postId={post._id}
//             isAuthenticated={isAuthenticated}
//           />
//         )}
//       </div>

//       {showPaymentModal && (
//         <PaymentModal
//           isOpen={showPaymentModal}
//           onClose={() => setShowPaymentModal(false)}
//           post={post}
//           onSuccess={handlePaymentSuccess}
//         />
//       )}
//     </>
//   );
// };

// export default PostCard;

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
import { FaOpencart } from "react-icons/fa6";
import { postService } from "../../services/post.service";
import { subscriptionService } from "../../services/subscription.service";
import { useAuthStore } from "../../store/authStore";
import PaymentModal from "../payment/PaymentModal";
import CommentsSection from "./CommentsSection";
import { showError, showSuccess, showInfo } from "../../utils/toast";

const PostCard = ({ post: initialPost, isBlurred = false, onUnlockClick }) => {
  const [showComments, setShowComments] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
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
      
      // Optimistically update the UI
      setPost(prevPost => ({
        ...prevPost,
        likes: isLiked 
          ? prevPost.likes.filter(id => id !== user._id) 
          : [...(prevPost.likes || []), user._id],
      }));
      
      // Return context with the previous value
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
    if (post.creditCost > 0 && !isUnlocked) {
      // Check if user has subscription first
      try {
        const subscriptionData = await subscriptionService.getMySubscription();
        const unlockCredits = subscriptionData?.subscription?.unlockCredits || 0;
        
        if (unlockCredits < post.creditCost) {
          showError(
            `Insufficient unlock credits! You have ${unlockCredits} credit${unlockCredits !== 1 ? 's' : ''}, but need ${post.creditCost} credit${post.creditCost !== 1 ? 's' : ''}.`
          );
          showInfo("Visit the Subscription page to purchase more credits!");
          return;
        }
        
        // User has enough credits, proceed with unlock
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
        setPost({ ...post, ...response.post, isUnlocked: true });
        queryClient.invalidateQueries(["posts"]);
        queryClient.invalidateQueries(["mySubscription"]);
        queryClient.invalidateQueries(["profile"]);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to unlock post";
        showError(errorMessage);
        if (
          errorMessage.includes("credit") ||
          errorMessage.includes("subscription")
        ) {
          showInfo("Visit the Subscription page to get more credits!");
        }
      }
    }
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
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    queryClient.invalidateQueries({ queryKey: ["paymentHistory"] });
    setShowPaymentModal(false);
  };

  return (
    <>
      <motion.div
        id={`post-${post._id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6 transition-all duration-300 ${
          isBlurred && !isUnlocked ? "post-blurred" : ""
        }`}
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
          <div className="flex flex-row justify-between items-center gap-3">
            <motion.h3
              className="font-bold text-gray-800 dark:text-white text-base sm:text-xl"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {post.title}
            </motion.h3>
            <motion.div className="flex items-center gap-2 rounded-full py-2  bg-gradient-to-r from-sky-600 via-sky-700 to-[--button-bg]">
              <div className="text-white text-center flex items-center gap-2 text-sm"></div>

              <div className="flex gap-2  items-center ">
                <img
                  src={post.author?.avatar || "/default-avatar.png"}
                  alt={post.author?.name || "Author avatar"}
                  className="w-8 h-8 object-contain"
                />
                <p className="text-base text-white pr-4 font-semibold tracking-wide truncate">
                  {authorUnavailable ? "Unavailable Author" : post.author?.name}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="relative p-4">
          <motion.div
            className="mb-4 flex lg:items-center flex-col lg:flex-row  lg:gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-semibold tracking-wide text-gray-700 dark:text-gray-300 text-lg">
              Requirement:
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-base">
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
            <p className="text-gray-600 dark:text-gray-400 text-base">
              {isUnlocked
                ? post.description
                : post.description?.substring(0, 100) + "..."}
            </p>
          </motion.div>

          {/* Unlock Section - Only show for OTHER users' posts that are not unlocked */}
          {!isOwnPost && !isUnlocked && !authorUnavailable && post.creditCost > 0 && (
            <motion.div
              className="mb-4 p-4 sm:p-5 bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-sky-200 dark:border-sky-800"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
                  <span className="text-base tracking-wide text-gray-700 dark:text-gray-300">
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
                  }`}
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
                    className="hidden sm:flex absolute inset-0 items-center justify-center gap-1"
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
          className="relative p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
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
              <span className="text-sm font-medium">
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
              <span className="text-sm font-medium">
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
              <span className="text-sm font-medium">{post.shares || 0}</span>
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
    </>
  );
};

export default PostCard;
