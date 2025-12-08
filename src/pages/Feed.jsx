import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import CreatePostModal from "../components/feed/CreatePostModal";
import PostCard from "../components/feed/PostCard";
import TrendingSection from "../components/feed/TrendingSection";
import { postService } from "../services/post.service";
import { useAuthStore } from "../store/authStore";
import {
  FiTrendingUp,
  FiClock,
  FiSearch,
  FiGrid,
  FiLock,
  FiList,
  FiFilter,
} from "react-icons/fi";

import Loader from "../components/common/Loader";
import SearchModal from "../components/layout/SearchModal";

const POSTS_PER_PAGE = 6;

const LoadingState = ({ message = "Loading posts..." }) => (
  <div className="flex justify-center items-center py-8">
    <div>
      <Loader message={message} />
    </div>
  </div>
);

const Feed = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("trending");
  const [viewMode, setViewMode] = useState("list");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, yesterday, recent
  const loadMoreRef = useRef(null);

  const [showNewPostLoading, setShowNewPostLoading] = useState(false);
  
  const {
    data: infinitePosts,
    isLoading: isPostsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchPosts,
  } = useInfiniteQuery({
    queryKey: ["posts", isAuthenticated],

    queryFn: ({ pageParam = 1 }) =>
      postService.getPosts({ page: pageParam, limit: POSTS_PER_PAGE }),
    getNextPageParam: (lastPage) => {
      if (!lastPage?.page || !lastPage?.pages) return undefined;
      return lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined;
    },
    enabled: isAuthenticated,
  });
  
  // Handle post creation event
  useEffect(() => {
    // Store refetch function in a ref so we can access it in the global handler
    if (refetchPosts) {
      window.feedRefetchPosts = refetchPosts;
    }
    
    const handlePostCreated = () => {
      setShowNewPostLoading(true);
      // Simulate 3-second loading
      setTimeout(() => {
        setShowNewPostLoading(false);
        // Refetch posts after the delay
        if (window.feedRefetchPosts) {
          window.feedRefetchPosts();
        }
      }, 3000);
    };
    
    window.onPostCreated = handlePostCreated;
    
    return () => {
      window.onPostCreated = null;
      window.feedRefetchPosts = null;
    };
  }, [refetchPosts]);

  const { data: publicPostsData, isLoading: isPublicLoading } = useQuery({
    queryKey: ["publicPosts"],
    queryFn: () => postService.getPublicPosts(),
    enabled: !isAuthenticated,

  });

  const handleUnlockClick = () => {
    navigate("/signup");
  };

  const posts = useMemo(() => {
    if (!isAuthenticated) return [];
    if (!infinitePosts?.pages) return [];
    return infinitePosts.pages.flatMap((page) => page.posts || []);
  }, [infinitePosts, isAuthenticated]);

  const displayPosts = useMemo(() => {
    if (!posts.length) return [];
    let list = [...posts];
    
    // Apply category/subcategory filters
    if (categoryFilter) {
      list = list.filter(post => post.category === categoryFilter);
    }
    
    if (subcategoryFilter) {
      list = list.filter(post => post.subcategory === subcategoryFilter);
    }
    
    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (dateFilter) {
        case "today":
          list = list.filter(post => {
            const postDate = new Date(post.createdAt);
            const postDay = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());
            return postDay.getTime() === today.getTime();
          });
          break;
        case "yesterday":
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          list = list.filter(post => {
            const postDate = new Date(post.createdAt);
            const postDay = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());
            return postDay.getTime() === yesterday.getTime();
          });
          break;
        case "recent":
          // Last 7 days
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          list = list.filter(post => {
            const postDate = new Date(post.createdAt);
            return postDate >= weekAgo;
          });
          break;
        default:
          break;
      }
    }
    
    if (filter === "latest") {
      return list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    }
    // trending score by likes/favorites/comments
    return list.sort((a, b) => {
      const score = (post) =>
        (post.likes?.length || 0) * 2 +
        (post.favorites?.length || 0) * 2 +
        (post.comments?.length || 0);
      return score(b) - score(a);
    });
  }, [posts, filter, categoryFilter, subcategoryFilter, dateFilter]);

  // Get unique categories and subcategories for filter options
  const categories = useMemo(() => {
    if (!posts.length) return [];
    const uniqueCategories = [...new Set(posts.map(post => post.category))];
    return uniqueCategories.filter(Boolean);
  }, [posts]);

  const subcategories = useMemo(() => {
    if (!posts.length) return [];
    const uniqueSubcategories = [...new Set(posts.map(post => post.subcategory))];
    return uniqueSubcategories.filter(Boolean);
  }, [posts]);

  const publicPosts = isAuthenticated
    ? []
    : publicPostsData?.posts?.slice(0, 3) || [];
  const privatePosts = isAuthenticated
    ? []
    : publicPostsData?.posts?.slice(3) || [];

  useEffect(() => {
    if (!isAuthenticated) return;
    const observerTarget = loadMoreRef.current;
    if (!observerTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        rootMargin: "200px",
      }
    );

    observer.observe(observerTarget);

    return () => {
      observer.unobserve(observerTarget);
    };
  }, [fetchNextPage, hasNextPage, isAuthenticated, isFetchingNextPage]);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed - Scrollable */}
          <div className="lg:col-span-2 overflow-y-auto max-h-[calc(100vh-2px)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500 pr-2">
            {/* Create Post Button */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <button
                onClick={() => setShowCreatePostModal(true)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-left text-gray-500 dark:text-gray-400 hover:border-sky-500 dark:hover:border-sky-500 transition-colors bg-gray-50 dark:bg-gray-700"
              >
                Write something...?
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <button
                onClick={() => setFilter("trending")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
                  filter === "trending"
                    ? "bg-[--button-bg] text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                <FiTrendingUp />
                Trending
              </button>
              <button
                onClick={() => setFilter("latest")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
                  filter === "latest"
                    ? "bg-sky-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                <FiClock />
                Latest
              </button>
              <button
                onClick={() => setShowSearchModal(true)}
                className="flex-1 flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg min-w-[220px] text-left text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <FiSearch className="text-gray-500 dark:text-gray-400" />
                <span className="text-sm sm:text-base">
                  Search requirements, keywords...
                </span>
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters
                    ? "bg-sky-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
                title="Toggle filters"
              >
                <FiFilter className="text-xl" />
              </button>
              <button
                onClick={() =>
                  setViewMode((prev) => (prev === "list" ? "grid" : "list"))
                }
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-sky-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
                title={
                  viewMode === "list" ? "Switch to grid" : "Switch to list"
                }
              >
                {viewMode === "list" ? (
                  <FiGrid className="text-xl" />
                ) : (
                  <FiList className="text-xl" />
                )}
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subcategory
                    </label>
                    <select
                      value={subcategoryFilter}
                      onChange={(e) => setSubcategoryFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    >
                      <option value="">All Subcategories</option>
                      {subcategories.map(subcategory => (
                        <option key={subcategory} value={subcategory}>{subcategory}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date
                    </label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    >
                      <option value="all">All Dates</option>
                      <option value="today">Today</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="recent">Last 7 Days</option>
                    </select>
                  </div>
                </div>
                {(categoryFilter || subcategoryFilter || dateFilter !== "all") && (
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setCategoryFilter("");
                        setSubcategoryFilter("");
                        setDateFilter("all");
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isAuthenticated && publicPosts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Featured Posts
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {publicPosts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      isBlurred={false}
                      onUnlockClick={handleUnlockClick}
                      viewMode="list"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Locked Posts Section for Non-Logged Users */}
            {!isAuthenticated && privatePosts.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    More Posts
                  </h2>
                  <button
                    onClick={handleUnlockClick}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
                  >
                    <FiLock />
                    Sign Up to View
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  {privatePosts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      isBlurred={true}
                      onUnlockClick={handleUnlockClick}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Posts for Logged In Users */}
            {isAuthenticated && (
              <div>
                {isPostsLoading || showNewPostLoading ? (
                  <LoadingState message={showNewPostLoading ? "New post is being processed..." : "Loading Requirements..."} />
                ) : displayPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No posts found matching your criteria
                    </p>
                  </div>
                ) : (
                  <>
                    <div
                      className={`grid gap-4 ${
                        viewMode === "grid"
                          ? "grid-cols-1 md:grid-cols-2"
                          : "grid-cols-1"
                      }`}
                    >
                      {displayPosts.map((post) => (
                        <PostCard
                          key={post._id}
                          post={post}
                          isBlurred={false}
                          onUnlockClick={handleUnlockClick}
                          viewMode={viewMode}
                        />
                      ))}
                    </div>
                    <div ref={loadMoreRef} className="h-1" />
                    {isFetchingNextPage && (
                      <div className="mt-6">
                        <LoadingState message="Loading more new requirements..." />
                      </div>
                    )}
                    {!hasNextPage && displayPosts.length > 0 && (
                      <div className="text-center text-xs text-gray-500 dark:text-gray-500 mt-6">
                        You&apos;re all caught up!
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - Static */}
          <div className="lg:col-span-1 sticky top-6 h-fit">
            <TrendingSection />
          </div>
        </div>

        {!isAuthenticated && isPublicLoading && (
          <LoadingState message="Preparing featured posts..." />
        )}
      </div>
      {showSearchModal && (
        <SearchModal onClose={() => setShowSearchModal(false)} />
      )}
      {showCreatePostModal && (
        <CreatePostModal
          isOpen={showCreatePostModal}
          onClose={() => setShowCreatePostModal(false)}
        />
      )}
    </MainLayout>
  );
};

export default Feed;