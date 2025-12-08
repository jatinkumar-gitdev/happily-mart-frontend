import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import adminAxios from "../../core/utils/adminAxios";
import DealStatusTag from "../../../../components/deal/DealStatusTag";
import { showSuccess, showError } from "../../../../utils/toast";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiCalendar,
  FiX,
  FiEye,
  FiEdit3,
  FiTrash2,
  FiCheck,
  FiTrendingUp,
} from "react-icons/fi";

const DealsManagement = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 20,
  });
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");

  useEffect(() => {
    fetchDeals();
  }, [pagination.page, filters]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await adminAxios.get("/admin/deals", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          ...filters,
        },
      });
      setDeals(response.data.deals);
      setPagination((prev) => ({
        ...prev,
        pages: response.data.pages,
        total: response.data.total,
      }));
    } catch (error) {
      showError("Failed to fetch deals");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedDeal || !newStatus) return;
    try {
      await adminAxios.put(`/admin/deals/${selectedDeal._id}/status`, {
        status: newStatus,
        notes: statusNotes || "Status updated by admin",
      });
      showSuccess("Deal status updated successfully");
      setShowStatusModal(false);
      setSelectedDeal(null);
      setNewStatus("");
      setStatusNotes("");
      fetchDeals();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleCloseDeal = async (dealId) => {
    if (!window.confirm("Are you sure you want to force close this deal?")) return;
    try {
      await adminAxios.delete(`/admin/deals/${dealId}`);
      showSuccess("Deal closed successfully");
      fetchDeals();
    } catch (error) {
      showError("Failed to close deal");
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      Contacted: "bg-blue-100 text-blue-800",
      Ongoing: "bg-yellow-100 text-yellow-800",
      Success: "bg-green-100 text-green-800",
      Fail: "bg-red-100 text-red-800",
      Closed: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysSince = (dateString) => {
    const days = Math.floor((Date.now() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    return days;
  };

  const openDetailModal = (deal) => {
    setSelectedDeal(deal);
    setShowDetailModal(true);
  };

  const openStatusModal = (deal) => {
    setSelectedDeal(deal);
    setNewStatus(deal.status);
    setStatusNotes("");
    setShowStatusModal(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const statusOptions = ["Contacted", "Ongoing", "Success", "Fail", "Closed"];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Deals Management</h1>
              <p className="text-gray-600">Monitor and manage all deals in the system</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{pagination.total}</div>
              <p className="text-gray-600">Total Deals</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by deal ID, post title..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Deals Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading deals...</p>
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🤝</div>
              <p className="text-gray-500 text-lg">No deals found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Deal ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Post
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Unlocker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {deals.map((deal) => (
                    <tr key={deal._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                        {deal._id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {deal.post?.title || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {deal.post?.category || ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-blue-700">
                              {deal.unlocker?.name?.charAt(0) || "?"}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {deal.unlocker?.name || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {deal.unlocker?.email || ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-green-700">
                              {deal.author?.name?.charAt(0) || "?"}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {deal.author?.name || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {deal.author?.email || ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <DealStatusTag status={deal.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {getDaysSince(deal.createdAt)}d ago
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(deal.createdAt).split(",")[0]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openDetailModal(deal)}
                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => openStatusModal(deal)}
                            className="text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                            title="Change Status"
                          >
                            <FiEdit3 className="w-4 h-4" />
                            Edit
                          </button>
                          {deal.status !== "Closed" &&
                            deal.status !== "Success" &&
                            deal.status !== "Fail" && (
                              <button
                                onClick={() => handleCloseDeal(deal._id)}
                                className="text-red-600 hover:text-red-900 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                                title="Close Deal"
                              >
                                <FiTrash2 className="w-4 h-4" />
                                Close
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-between items-center p-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Page <span className="font-semibold">{pagination.page}</span> of{" "}
                <span className="font-semibold">{pagination.pages}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium text-gray-700"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium text-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Deal Details</h2>
                <p className="text-sm text-gray-500 mt-1">ID: {selectedDeal._id}</p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedDeal(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Overview */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Current Status</p>
                    <DealStatusTag status={selectedDeal.status} size="lg" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-2">Deal Age</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {getDaysSince(selectedDeal.createdAt)} days
                    </p>
                  </div>
                </div>
              </div>

              {/* Post Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiTrendingUp className="w-5 h-5 text-blue-600" />
                    Post Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                        Post Title
                      </p>
                      <p className="text-gray-900 font-medium">
                        {selectedDeal.post?.title || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                        Requirement
                      </p>
                      <p className="text-gray-700">
                        {selectedDeal.post?.requirement || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                        Category
                      </p>
                      <p className="text-gray-700">
                        {selectedDeal.post?.category || "N/A"} /{" "}
                        {selectedDeal.post?.subcategory || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Unlocker Info */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiUser className="w-5 h-5 text-purple-600" />
                    Unlocker Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                        Name
                      </p>
                      <p className="text-gray-900 font-medium">
                        {selectedDeal.unlocker?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                        Email
                      </p>
                      <p className="text-gray-700 flex items-center gap-2">
                        <FiMail className="w-4 h-4 text-gray-500" />
                        {selectedDeal.unlocker?.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                        Company
                      </p>
                      <p className="text-gray-700">
                        {selectedDeal.unlocker?.companyName || "N/A"}
                      </p>
                    </div>
                    {selectedDeal.unlocker?.designation && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                          Designation
                        </p>
                        <p className="text-gray-700 flex items-center gap-2">
                          <FiBriefcase className="w-4 h-4 text-gray-500" />
                          {selectedDeal.unlocker.designation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Author Info */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-green-600" />
                  Author Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      Name
                    </p>
                    <p className="text-gray-900 font-medium">
                      {selectedDeal.author?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      Email
                    </p>
                    <p className="text-gray-700 flex items-center gap-2">
                      <FiMail className="w-4 h-4 text-gray-500" />
                      {selectedDeal.author?.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      Company
                    </p>
                    <p className="text-gray-700">
                      {selectedDeal.author?.companyName || "N/A"}
                    </p>
                  </div>
                  {selectedDeal.author?.designation && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                        Designation
                      </p>
                      <p className="text-gray-700 flex items-center gap-2">
                        <FiBriefcase className="w-4 h-4 text-gray-500" />
                        {selectedDeal.author.designation}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirmations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-3">
                    Confirmations
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Unlocker Confirmed:</span>
                      {selectedDeal.confirmations?.success?.unlocker?.confirmed ? (
                        <span className="flex items-center gap-1 text-green-600 font-semibold">
                          <FiCheck className="w-4 h-4" /> Yes
                        </span>
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Author Confirmed:</span>
                      {selectedDeal.confirmations?.success?.author?.confirmed ? (
                        <span className="flex items-center gap-1 text-green-600 font-semibold">
                          <FiCheck className="w-4 h-4" /> Yes
                        </span>
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-3">
                    Timeline
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        Created: {formatDate(selectedDeal.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        Updated: {formatDate(selectedDeal.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status History */}
              {selectedDeal.statusHistory && selectedDeal.statusHistory.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-4">Status History</p>
                  <div className="space-y-3">
                    {selectedDeal.statusHistory.map((history, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 pb-3 border-b border-gray-100 last:border-b-0"
                      >
                        <DealStatusTag status={history.status} size="sm" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 font-medium">
                            {history.notes || "Status update"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(history.updatedAt || history.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedDeal(null);
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openStatusModal(selectedDeal);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Change Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Change Deal Status</h2>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedDeal(null);
                    setNewStatus("");
                    setStatusNotes("");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 uppercase font-semibold mb-2">
                  Current Status
                </p>
                <DealStatusTag status={selectedDeal.status} size="md" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add notes about this status change..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="3"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedDeal(null);
                    setNewStatus("");
                    setStatusNotes("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusChange}
                  disabled={newStatus === selectedDeal.status}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealsManagement;
