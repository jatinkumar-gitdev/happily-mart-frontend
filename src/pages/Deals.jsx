import React, { useState, useEffect, useCallback } from "react";
import { useDealStore } from "../store/dealStore";
import { useAuthStore } from "../store/authStore";
import DealStatusTag from "../components/deal/DealStatusTag";
import DealProgressIndicator from "../components/deal/DealProgressIndicator";
import MainLayout from "../components/layout/MainLayout";
import Button from "../components/common/Button";
import {
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiCheck,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiUser,
  FiFileText,
  FiMessageCircle,
  FiAlertCircle,
  FiDollarSign,
  FiCalendar,
  FiArrowRight,
} from "react-icons/fi";
import { showSuccess, showError } from "../utils/toast";

const ITEMS_PER_PAGE = 10;

const formatDate = (dateString, options = {}) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
};

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffDays < 1) {
    if (diffHours < 1) {
      return diffMins <= 1 ? "just now" : `${diffMins} minutes ago`;
    }
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "1 week ago";
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  if (diffMonths === 1) return "1 month ago";
  if (diffMonths < 12) return `${diffMonths} months ago`;
  return formatDate(dateString);
};

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "Contacted", label: "Contacted" },
  { value: "Ongoing", label: "Ongoing" },
  { value: "Success", label: "Success" },
  { value: "Fail", label: "Failed" },
  { value: "Closed", label: "Closed" },
];

const Deals = () => {
  const { user } = useAuthStore();
  const {
    deals,
    loading,
    fetchUserDeals,
    updateDealStatus,
    dealStats,
    fetchDealStats,
  } = useDealStore();

  const [activeTab, setActiveTab] = useState("unlocker");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmationType, setConfirmationType] = useState(null);
  const [confirmNotes, setConfirmNotes] = useState("");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDeals, setTotalDeals] = useState(0);

  const loadDeals = useCallback(async () => {
    try {
      const response = await fetchUserDeals({
        role: activeTab,
        status: statusFilter,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });
      if (response) {
        setTotalPages(response.pages || 1);
        setTotalDeals(response.total || 0);
      }
    } catch (error) {
      showError("Failed to load deals");
    }
  }, [activeTab, statusFilter, currentPage, fetchUserDeals]);

  useEffect(() => {
    loadDeals();
    fetchDealStats();
  }, [loadDeals, fetchDealStats]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, statusFilter]);

  const handleRefresh = () => {
    loadDeals();
    fetchDealStats();
    showSuccess("Deals refreshed");
  };

  const handleStatusUpdate = async (dealId, newStatus) => {
    try {
      setStatusUpdateLoading(true);
      await updateDealStatus(dealId, newStatus, confirmNotes);
      showSuccess(`Deal status updated to ${newStatus}`);
      setShowConfirmModal(false);
      setConfirmationType(null);
      setConfirmNotes("");
      loadDeals();
    } catch (error) {
      showError(error.message || "Failed to update status");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const openConfirmModal = (deal, type) => {
    setSelectedDeal(deal);
    setConfirmationType(type);
    setShowConfirmModal(true);
  };

  const maskInfo = (text, showFirst = 3) => {
    if (!text) return "N/A";
    if (text.length <= showFirst) return text;
    return text.slice(0, showFirst) + "***";
  };

  const getDaysSinceCreated = (createdAt) => {
    return getTimeAgo(createdAt);
  };

  const getNextStatuses = (currentStatus, role) => {
    const statusFlow = {
      unlocker: {
        Contacted: ["Ongoing"],
        Ongoing: ["Success", "Fail"],
      },
      author: {
        Contacted: ["Ongoing"],
        Ongoing: ["Success", "Fail"],
      },
    };
    return statusFlow[role]?.[currentStatus] || [];
  };

  const canConfirm = (deal) => {
    if (deal.status !== "Success" && deal.status !== "Fail") return false;
    if (activeTab === "unlocker") return !deal.unlockerConfirmed;
    if (activeTab === "author") return !deal.authorConfirmed;
    return false;
  };

  const renderDealCard = (deal) => {
    const isUnlocker = activeTab === "unlocker";
    const otherParty = isUnlocker ? deal.author : deal.unlocker;
    const nextStatuses = getNextStatuses(deal.status, activeTab);
    const awaitingConfirmation =
      (deal.status === "Success" || deal.status === "Fail") &&
      (!deal.unlockerConfirmed || !deal.authorConfirmed);

    return (
      <div
        key={deal._id}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="p-4 sm:p-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                #{deal._id?.slice(-8)}
              </span>
              <DealStatusTag status={deal.status} size="sm" />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <FiClock className="w-3 h-3" />
              {getDaysSinceCreated(deal.createdAt)}
            </div>
          </div>

          {/* Post Title */}
          <div className="mb-4">
            <div className="flex items-start gap-2">
              <FiFileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Post</p>
                <p className="font-medium text-gray-900 dark:text-white line-clamp-2">
                  {deal.post?.title || "Untitled Post"}
                </p>
              </div>
            </div>
          </div>

          {/* Other Party Info */}
          <div className="mb-4">
            <div className="flex items-start gap-2">
              <FiUser className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isUnlocker ? "Author" : "Unlocker"}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {maskInfo(otherParty?.name || "Unknown", 4)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {maskInfo(otherParty?.email || "", 5)}
                </p>
              </div>
            </div>
          </div>

          {/* Deal Progress */}
          <div className="mb-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <DealProgressIndicator status={deal.status} size="sm" />
          </div>

          {/* Confirmation Status */}
          {awaitingConfirmation && (
            <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300 text-sm">
                <FiAlertCircle className="w-4 h-4" />
                <span className="font-medium">Awaiting Confirmation</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span
                  className={`px-2 py-1 rounded ${
                    deal.unlockerConfirmed
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  Unlocker: {deal.unlockerConfirmed ? "✓ Confirmed" : "Pending"}
                </span>
                <span
                  className={`px-2 py-1 rounded ${
                    deal.authorConfirmed
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  Author: {deal.authorConfirmed ? "✓ Confirmed" : "Pending"}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedDeal(deal);
                setShowDetailModal(true);
              }}
              className="flex items-center gap-1"
            >
              <FiEye className="w-3 h-3" />
              Details
            </Button>

            {nextStatuses.map((status) => (
              <Button
                key={status}
                variant={status === "Success" ? "primary" : "danger"}
                size="sm"
                onClick={() => openConfirmModal(deal, status)}
                className="flex items-center gap-1"
              >
                {status === "Success" ? (
                  <FiCheck className="w-3 h-3" />
                ) : status === "Fail" ? (
                  <FiX className="w-3 h-3" />
                ) : (
                  <FiArrowRight className="w-3 h-3" />
                )}
                {status === "Ongoing" ? "Mark Ongoing" : status}
              </Button>
            ))}

            {canConfirm(deal) && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => openConfirmModal(deal, "confirm")}
                className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600"
              >
                <FiCheck className="w-3 h-3" />
                Confirm Outcome
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalDeals)}{" "}
          - {Math.min(currentPage * ITEMS_PER_PAGE, totalDeals)} of {totalDeals}{" "}
          deals
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                1
              </button>
              {startPage > 2 && (
                <span className="px-2 text-gray-500">...</span>
              )}
            </>
          )}

          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                page === currentPage
                  ? "bg-sky-500 text-white border-sky-500"
                  : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderDetailModal = () => {
    if (!showDetailModal || !selectedDeal) return null;

    const deal = selectedDeal;
    const isUnlocker = user?._id === deal.unlocker?._id;

    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Deal Details
              </h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedDeal(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-4 sm:p-6 space-y-6">
            {/* Deal Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Deal ID
                </p>
                <p className="font-mono text-gray-900 dark:text-white">
                  {deal._id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Status
                </p>
                <DealStatusTag status={deal.status} size="md" />
              </div>
            </div>

            {/* Post Info */}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Post
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {deal.post?.title || "Untitled Post"}
              </p>
              {deal.post?.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {deal.post.description}
                </p>
              )}
            </div>

            {/* Parties */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Unlocker
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {isUnlocker
                    ? deal.unlocker?.name
                    : maskInfo(deal.unlocker?.name, 4)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isUnlocker
                    ? deal.unlocker?.email
                    : maskInfo(deal.unlocker?.email, 5)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Author
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {!isUnlocker
                    ? deal.author?.name
                    : maskInfo(deal.author?.name, 4)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {!isUnlocker
                    ? deal.author?.email
                    : maskInfo(deal.author?.email, 5)}
                </p>
              </div>
            </div>

            {/* Deal Progress */}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Progress
              </p>
              <DealProgressIndicator status={deal.status} size="md" />
            </div>

            {/* Credit Adjustments */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FiDollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                  Credit Details
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Credits Locked
                  </p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-200">
                    {deal.creditsLocked || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Credits Transferred
                  </p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-200">
                    {deal.creditsTransferred || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Confirmation Status */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Confirmation Status
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    deal.unlockerConfirmed
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-gray-100 dark:bg-gray-600"
                  }`}
                >
                  {deal.unlockerConfirmed ? (
                    <FiCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <FiClock className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">Unlocker</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {deal.unlockerConfirmed ? "Confirmed" : "Pending"}
                    </p>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    deal.authorConfirmed
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-gray-100 dark:bg-gray-600"
                  }`}
                >
                  {deal.authorConfirmed ? (
                    <FiCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <FiClock className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">Author</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {deal.authorConfirmed ? "Confirmed" : "Pending"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status History Timeline */}
            {deal.statusHistory && deal.statusHistory.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Status History
                </h3>
                <div className="relative">
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-600"></div>
                  <div className="space-y-4">
                    {deal.statusHistory.map((history, index) => (
                      <div key={index} className="relative flex gap-4 pl-8">
                        <div
                          className={`absolute left-1 w-5 h-5 rounded-full flex items-center justify-center ${
                            index === 0
                              ? "bg-blue-500"
                              : "bg-gray-300 dark:bg-gray-500"
                          }`}
                        >
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <DealStatusTag
                              status={history.status}
                              size="xs"
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDateTime(history.timestamp)}
                            </span>
                          </div>
                          {history.notes && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {history.notes}
                            </p>
                          )}
                          {history.changedBy && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              By: {maskInfo(history.changedBy?.name, 4)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {deal.notes && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Notes
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    {deal.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <FiCalendar className="w-4 h-4" />
                <span>
                  Created: {formatDate(deal.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <FiClock className="w-4 h-4" />
                <span>
                  Updated: {formatDate(deal.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderConfirmModal = () => {
    if (!showConfirmModal || !selectedDeal) return null;

    const isConfirmation = confirmationType === "confirm";
    const statusLabel =
      confirmationType === "confirm"
        ? `Confirm ${selectedDeal.status} Outcome`
        : `Mark as ${confirmationType}`;

    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {statusLabel}
              </h2>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmationType(null);
                  setConfirmNotes("");
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400">
                {isConfirmation
                  ? `You are confirming the ${selectedDeal.status.toLowerCase()} outcome of this deal. This action is required from both parties.`
                  : `You are about to change the deal status to ${confirmationType}.`}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={confirmNotes}
                onChange={(e) => setConfirmNotes(e.target.value)}
                placeholder="Add any notes about this update..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmationType(null);
                  setConfirmNotes("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant={
                  confirmationType === "Fail" || confirmationType === "Closed"
                    ? "danger"
                    : "primary"
                }
                onClick={() =>
                  handleStatusUpdate(
                    selectedDeal._id,
                    isConfirmation ? selectedDeal.status : confirmationType
                  )
                }
                disabled={statusUpdateLoading}
                className="flex-1"
              >
                {statusUpdateLoading ? "Updating..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
              Manage your deal interactions and track progress
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {Object.entries(dealStats).map(([status, count]) => (
            <div
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? "" : status)}
              className={`bg-white dark:bg-gray-800 rounded-xl p-4 border cursor-pointer transition-all ${
                statusFilter === status
                  ? "border-sky-500 ring-2 ring-sky-200 dark:ring-sky-800"
                  : "border-gray-200 dark:border-gray-700 hover:border-sky-300"
              }`}
            >
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {count}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {status}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("unlocker")}
            className={`px-4 py-3 font-medium transition-colors relative ${
              activeTab === "unlocker"
                ? "text-sky-600 dark:text-sky-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <FiMessageCircle className="w-4 h-4" />
              My Unlocks
            </div>
            {activeTab === "unlocker" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("author")}
            className={`px-4 py-3 font-medium transition-colors relative ${
              activeTab === "author"
                ? "text-sky-600 dark:text-sky-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <FiFileText className="w-4 h-4" />
              My Posts
            </div>
            {activeTab === "author" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500"></div>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 sm:max-w-xs">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none cursor-pointer"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {statusFilter && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setStatusFilter("")}
              className="flex items-center gap-1"
            >
              <FiX className="w-3 h-3" />
              Clear Filter
            </Button>
          )}
        </div>

        {/* Deals List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading deals...</p>
          </div>
        ) : deals.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No deals found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === "unlocker"
                ? "You haven't unlocked any posts yet. Start exploring the feed!"
                : "No one has unlocked your posts yet. Keep sharing great content!"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {deals.map(renderDealCard)}
            </div>
            {renderPagination()}
          </>
        )}
      </div>

      {/* Modals */}
      {renderDetailModal()}
      {renderConfirmModal()}
    </MainLayout>
  );
};

export default Deals;
