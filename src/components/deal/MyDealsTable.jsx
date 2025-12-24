import React, { useState } from "react";
import { FiCheck, FiX, FiRefreshCw, FiFilter, FiCalendar, FiAlertTriangle } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";
import { useUserPostsStats, useUpdateDealToggleStatus } from "../../api/deals/useDeals";
import { showError, showSuccess } from "../../utils/toast";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 10;

const MyDealsTable = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Lost modal state
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [postToMarkLost, setPostToMarkLost] = useState(null);

  const { data, isLoading } = useUserPostsStats(currentPage, ITEMS_PER_PAGE, filter === "all" ? "all" : filter);
  const updateToggleMutation = useUpdateDealToggleStatus();

  const posts = data?.posts || [];
  const totalPages = data?.pagination?.pages || 1;
  const totalPosts = data?.pagination?.total || 0;

  const handleRefresh = () => {
    queryClient.invalidateQueries(["userPostsStats"]);
    showSuccess("Deals refreshed");
  };

  // Open lost modal
  const openLostModal = (post) => {
    setPostToMarkLost(post);
    setIsLostModalOpen(true);
  };

  // Close lost modal
  const closeLostModal = () => {
    setIsLostModalOpen(false);
    setPostToMarkLost(null);
  };

  // Confirm mark as lost
  const confirmMarkLost = async () => {
    if (postToMarkLost) {
      try {
        await updateToggleMutation.mutateAsync({ postId: postToMarkLost._id, status: "Fail" });
        showSuccess("Deal status updated");
        closeLostModal();
      } catch (error) {
        showError(error.message || "Failed to update deal status");
      }
    }
  };

  const handleToggleStatus = async (postId, newStatus) => {
    try {
      await updateToggleMutation.mutateAsync({ postId, status: newStatus });
      showSuccess("Deal status updated");
    } catch (error) {
      showError(error.message || "Failed to update deal status");
    }
  };

  // Get badge text based on won count
  const getBadgeText = (wonCount) => {
    if (wonCount >= 150) return "150+ ⭐";
    if (wonCount >= 100) return "100+ ⭐";
    if (wonCount >= 50) return "50+ ⭐";
    if (wonCount >= 20) return "20+ ⭐";
    if (wonCount >= 10) return "10+ ⭐";
    return "";
  };

  // Get badge color
  const getBadgeColor = (wonCount) => {
    if (wonCount >= 150) return "bg-purple-100 text-purple-800";
    if (wonCount >= 100) return "bg-blue-100 text-blue-800";
    if (wonCount >= 50) return "bg-green-100 text-green-800";
    if (wonCount >= 20) return "bg-yellow-100 text-yellow-800";
    if (wonCount >= 10) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  // Get status color
  const getStatusColor = (dealResult) => {
    switch (dealResult) {
      case "Won":
        return "bg-green-100 text-green-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      case "Provisional":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Check if post is expired
  const isPostExpired = (expiresAt) => {
    return expiresAt && new Date() > new Date(expiresAt);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Deals
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track all your posts and their performance
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 appearance-none cursor-pointer"
            >
              <option value="all">All Deals</option>
              <option value="Won">Won Deals ✅</option>
              <option value="Failed">Failed Deals ❌</option>
              <option value="Pending">Pending Deals ⏳</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {posts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No deals yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === "all"
                ? "Start creating posts to see your deals here!"
                : `No ${filter.toLowerCase()} deals found`}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Post Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Views / Contacts
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Validity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {posts.map((post) => (
                      <tr key={post._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {post.title}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {post.category}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="text-sm text-gray-900 dark:text-white">
                              👁️ {post.unlockedDetailCount || 0}
                            </div>
                            <div className="text-sm text-gray-900 dark:text-white">
                              🤝 {post.contactCount || 0}
                            </div>
                            {post.wonCount > 0 && (
                              <span className={`px-2 py-1 text-xs font-bold rounded-full ${getBadgeColor(post.wonCount)}`}>
                                {getBadgeText(post.wonCount)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(post.dealResult)}`}>
                            {post.dealResult}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-col">
                            <span className="text-gray-900 dark:text-white">
                              {post.validityPeriod} days
                            </span>
                            <span className={`text-xs ${isPostExpired(post.expiresAt) ? "text-red-600" : "text-gray-500 dark:text-gray-400"}`}>
                              {new Date(post.expiresAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {post.dealResult === "Pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleToggleStatus(post._id, "Success")}
                                className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50"
                                title="Mark as Won"
                              >
                                <FiCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openLostModal(post)}
                                className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                title="Mark as Failed"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          {post.dealResult === "Won" && (
                            <span className="text-green-600 font-semibold">✅ Won</span>
                          )}
                          {post.dealResult === "Failed" && (
                            <span className="text-red-600 font-semibold">❌ Failed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
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
                  {postToMarkLost && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Post: {postToMarkLost.title}
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
    </>
  );
};

export default MyDealsTable;
