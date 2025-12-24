import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import MainLayout from "../components/layout/MainLayout";
import { FiRefreshCw, FiEye, FiCheck, FiX, FiChevronLeft, FiChevronRight, FiFilter, FiCalendar, FiAlertTriangle } from "react-icons/fi";
import { postService } from "../services/post.service";
import { showError, showSuccess } from "../utils/toast";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 10;

const Deals = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, success, fail, pending
  const [sortBy, setSortBy] = useState("createdAt"); // createdAt, contactCount
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  
  // Lost modal state
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Fetch creator posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getMyPosts({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        filter,
        sortBy,
      });
      
      setPosts(response.posts || []);
      setTotalPages(response.pages || 1);
      setTotalPosts(response.total || 0);
    } catch (error) {
      showError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage, filter, sortBy]);

  const handleRefresh = () => {
    fetchPosts();
    showSuccess("Posts refreshed");
  };

  // Handle deal toggle
  const handleDealToggle = async (postId, status) => {
    try {
      const response = await postService.updateDealToggleStatus(postId, status);
      showSuccess(response.message);
      fetchPosts(); // Refresh the list
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update deal status");
    }
  };

  // Open lost modal
  const openLostModal = (post) => {
    setSelectedPost(post);
    setIsLostModalOpen(true);
  };

  // Close lost modal
  const closeLostModal = () => {
    setIsLostModalOpen(false);
    setSelectedPost(null);
  };

  // Confirm mark as lost
  const confirmMarkLost = async () => {
    if (selectedPost) {
      try {
        const response = await postService.updateDealToggleStatus(selectedPost._id, "Fail");
        showSuccess(response.message);
        fetchPosts(); // Refresh the list
        closeLostModal();
      } catch (error) {
        showError(error.response?.data?.message || "Failed to update deal status");
      }
    }
  };

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

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Deals
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your creator posts and track prospect interactions
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 sm:max-w-xs">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="all">All Posts</option>
              <option value="success">Won Deals</option>
              <option value="fail">Lost Deals</option>
              <option value="pending">Pending Deals</option>
            </select>
          </div>
          
          <div className="relative flex-1 sm:max-w-xs">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="createdAt">Latest First</option>
              <option value="contactCount">Most Contacts</option>
            </select>
          </div>
        </div>

        {/* Posts Table */}
        {posts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No posts found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You haven't created any posts yet. Start creating to track prospect interactions!
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                              post.dealToggleStatus === "Success" 
                                ? "bg-green-100 text-green-800" 
                                : post.dealToggleStatus === "Fail" 
                                  ? "bg-red-100 text-red-800" 
                                  : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {post.dealToggleStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {post.expiresAt 
                              ? new Date(post.expiresAt).toLocaleDateString() 
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {post.dealToggleStatus === "Pending" ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleDealToggle(post._id, "Success")}
                                  className="text-green-600 hover:text-green-900 flex items-center"
                                >
                                  <FiCheck className="mr-1" /> Won
                                </button>
                                <button
                                  onClick={() => openLostModal(post)}
                                  className="text-red-600 hover:text-red-900 flex items-center"
                                >
                                  <FiX className="mr-1" /> Lost
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleDealToggle(post._id, "Pending")}
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
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalPosts)}{" "}
                    to {Math.min(currentPage * ITEMS_PER_PAGE, totalPosts)} of {totalPosts} posts
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => paginate(page)}
                        className={`px-3 py-1.5 rounded-lg border transition-colors ${
                          page === currentPage
                            ? "bg-sky-500 text-white border-sky-500"
                            : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Deal History Section */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Deal History
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Post
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Contacts
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {posts
                      .filter(post => post.dealToggleStatus === "Success" || post.dealToggleStatus === "Fail")
                      .map((post) => (
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
                              {post.contactCount || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              post.dealToggleStatus === "Success" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                              {post.dealToggleStatus === "Success" ? "Won" : "Lost"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(post.updatedAt || post.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
                
                {posts.filter(post => post.dealToggleStatus === "Success" || post.dealToggleStatus === "Fail").length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No deal history found. Your deal history will appear here once you mark posts as won or lost.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Lost Confirmation Modal */}
      <AnimatePresence>
        {isLostModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <FiAlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Mark Deal as Lost?
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Are you sure you want to mark this deal as lost?
                  </p>
                  {selectedPost && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Post: {selectedPost.title}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeLostModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMarkLost}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Yes, Mark as Lost
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
};

export default Deals;