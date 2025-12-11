import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiCheck, FiX, FiRefreshCw, FiFilter, FiChevronDown, FiCalendar } from "react-icons/fi";
import { postService } from "../../services/post.service";
import useSocket from "../../hooks/useSocket";
import { showError, showSuccess } from "../../utils/toast";
import PostValidityManager from "./PostValidityManager";

const MyDeals = () => {
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  const [localPosts, setLocalPosts] = useState([]);
  const queryClient = useQueryClient();
  const { on, off } = useSocket();

  // Fetch creator posts
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["myPosts", currentPage, filter, sortBy],
    queryFn: async () => {
      const response = await postService.getMyPosts({
        page: currentPage,
        limit: postsPerPage,
        filter,
        sortBy,
      });
      return response;
    },
  });

  // Update local posts when data changes
  useEffect(() => {
    if (data?.posts) {
      setLocalPosts(data.posts);
    }
  }, [data?.posts]);

  // Socket listeners for real-time deal status updates
  useEffect(() => {
    const handleDealStatusChanged = (data) => {
      setLocalPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === data.postId
            ? {
                ...post,
                dealToggleStatus: data.dealToggleStatus,
                dealResult: data.dealResult || data.dealToggleStatus,
                postStatus: data.postStatus,
                isActive: data.isActive,
              }
            : post
        )
      );
    };

    const handleValidityUpdated = (data) => {
      setLocalPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === data.postId
            ? {
                ...post,
                validityPeriod: data.validityPeriod,
                expiresAt: data.expiresAt,
                postStatus: data.postStatus,
                isActive: data.isActive,
              }
            : post
        )
      );
    };

    on("post:dealStatusChanged", handleDealStatusChanged);
    on("post:validityUpdated", handleValidityUpdated);

    return () => {
      off("post:dealStatusChanged", handleDealStatusChanged);
      off("post:validityUpdated", handleValidityUpdated);
    };
  }, [on, off]);

  // Mutation for updating deal toggle status
  const updateDealToggleMutation = useMutation({
    mutationFn: ({ postId, dealToggleStatus }) =>
      postService.updateDealToggleStatus(postId, dealToggleStatus),
    onSuccess: (data) => {
      showSuccess(data.message);
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
      queryClient.invalidateQueries({ queryKey: ["userPostsStats"] });
      queryClient.invalidateQueries({ queryKey: ["dealsWorkspace"] });
    },
    onError: (error) => {
      showError(error.response?.data?.message || "Failed to update deal status");
    },
  });

  // Handle deal toggle
  const handleDealToggle = (postId, status) => {
    updateDealToggleMutation.mutate({ postId, dealToggleStatus: status });
  };

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiRefreshCw className="animate-spin text-2xl text-blue-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error: {error.message}
      </div>
    );
  }

  const posts = localPosts.length > 0 ? localPosts : data?.posts || [];
  const totalPages = data?.pages || 1;

  // Get badge text based on contact count
  const getBadgeText = (contactCount) => {
    if (contactCount >= 150) return "150+";
    if (contactCount >= 100) return "100+";
    if (contactCount >= 50) return "50+";
    if (contactCount >= 20) return "20+";
    if (contactCount >= 10) return "10+";
    return "";
  };

  // Get badge color based on contact count
  const getBadgeColor = (contactCount) => {
    if (contactCount >= 150) return "bg-purple-500";
    if (contactCount >= 100) return "bg-blue-500";
    if (contactCount >= 50) return "bg-green-500";
    if (contactCount >= 20) return "bg-yellow-500";
    if (contactCount >= 10) return "bg-orange-500";
    return "bg-gray-500";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Deals</h2>
        
        <div className="flex flex-wrap gap-3">
          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 pl-3 pr-10 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Posts</option>
              <option value="success">Won Deals</option>
              <option value="fail">Lost Deals</option>
              <option value="pending">Pending Deals</option>
            </select>
            <FiFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 pl-3 pr-10 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt">Latest First</option>
              <option value="contactCount">Most Contacts</option>
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No posts found</div>
          <p className="text-gray-500 dark:text-gray-400">
            You haven't created any posts yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Post
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Views
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contacts
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Expiry
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {posts.map((post) => {
                const badgeText = getBadgeText(post.contactCount || 0);
                const badgeColor = getBadgeColor(post.contactCount || 0);
                
                return (
                  <tr key={post._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {post.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {post.requirement}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {post.unlockedDetailCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {post.contactCount || 0}
                        </div>
                        {badgeText && (
                          <span className={`ml-2 px-2 py-1 text-xs font-bold rounded-full text-white ${badgeColor}`}>
                            {badgeText}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.dealResult === "Won" 
                          ? "bg-green-100 text-green-800" 
                          : post.dealResult === "Failed" 
                            ? "bg-red-100 text-red-800" 
                            : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {post.dealResult || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {post.expiresAt 
                        ? new Date(post.expiresAt).toLocaleDateString() 
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {post.dealResult === "Pending" || !post.dealResult ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDealToggle(post._id, "Success")}
                            disabled={updateDealToggleMutation.isPending}
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <FiCheck className="mr-1" /> Won
                          </button>
                          <button
                            onClick={() => handleDealToggle(post._id, "Fail")}
                            disabled={updateDealToggleMutation.isPending}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <FiX className="mr-1" /> Lost
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDealToggle(post._id, "Pending")}
                          disabled={updateDealToggleMutation.isPending}
                          className="text-gray-600 hover:text-gray-900 flex items-center"
                        >
                          <FiRefreshCw className="mr-1" /> Reset
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      )}
      
      {/* Validity Manager for each post */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Post Validity Management</h3>
        <div className="space-y-4">
          {posts.map((post) => (
            <PostValidityManager key={post._id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyDeals;