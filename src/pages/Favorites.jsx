import { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import MainLayout from "../components/layout/MainLayout";
import PostCard from "../components/feed/PostCard";
import { postService } from "../services/post.service";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

const POSTS_PER_PAGE = 6;

const LoadingState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-3 animate-pulse">
      <HiOutlineLightningBolt className="text-2xl text-yellow-500 dark:text-yellow-400 animate-bounce" />
    </div>
    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
      Happily Mart
    </p>
    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{message}</p>
  </div>
);

const Favorites = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const loadMoreRef = useRef(null);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["favoritePosts"],
    queryFn: ({ pageParam = 1 }) =>
      postService.getFavoritePosts({ page: pageParam, limit: POSTS_PER_PAGE }),
    getNextPageParam: (lastPage) => {
      if (!lastPage?.page || !lastPage?.pages) return undefined;
      return lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined;
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const posts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.posts || []);
  }, [data]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(target);

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isAuthenticated]);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState message="Gathering your saved posts..." />;
    }

    if (posts.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center mb-4">
            <HiOutlineLightningBolt className="text-2xl text-yellow-500 dark:text-yellow-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            No favorites yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Mark posts as favorite to quickly find them here.
          </p>
          <button
            onClick={() => navigate("/feed")}
            className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Browse Feed
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 gap-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} isBlurred={false} />
          ))}
        </div>
        <div ref={loadMoreRef} className="h-1" />
        {isFetchingNextPage && (
          <LoadingState message="Loading more favorites..." />
        )}
        {!hasNextPage && posts.length > 0 && (
          <div className="text-center text-xs text-gray-500 dark:text-gray-500 mt-6">
            You&apos;ve reached the end of your favorites.
          </div>
        )}
      </>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Favorite Posts
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              All the posts you&apos;ve marked as favorite live here.
            </p>
          </div>
        </div>
        {renderContent()}
      </div>
    </MainLayout>
  );
};

export default Favorites;

