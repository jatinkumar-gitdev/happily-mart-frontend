import React, { useState, useEffect } from "react";
import adminAxios from "../../core/utils/adminAxios";
import { showSuccess, showError } from "../../../../utils/toast";

const PostsManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 20,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    dealStatus: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [pagination.page, filters]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await adminAxios.get("/admin/posts", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          ...filters,
        },
      });
      setPosts(response.data.posts);
      setPagination((prev) => ({
        ...prev,
        pages: response.data.pages,
        total: response.data.total,
      }));
    } catch (error) {
      showError("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (postId, currentStatus) => {
    try {
      await adminAxios.put(`/admin/posts/${postId}/status`, {
        isActive: !currentStatus,
      });
      showSuccess(`Post ${currentStatus ? "deactivated" : "activated"} successfully`);
      fetchPosts();
    } catch (error) {
      showError("Failed to update post status");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const openDetailModal = (post) => {
    setSelectedPost(post);
    setShowDetailModal(true);
  };

  const getDealStatusBadgeColor = (status) => {
    const colors = {
      available: "bg-green-100 text-green-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      completed: "bg-blue-100 text-blue-800",
      locked: "bg-purple-100 text-purple-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Posts Management</h1>
        <span className="text-gray-500">Total: {pagination.total} posts</span>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title or description..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
        />
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={filters.dealStatus}
          onChange={(e) => handleFilterChange("dealStatus", e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Deal Status</option>
          <option value="available">Available</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="locked">Locked</option>
        </select>
        <select
          value={filters.sortOrder}
          onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {/* Posts Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-500">No posts found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Post
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deal Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Likes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unlocks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {post.images && post.images.length > 0 ? (
                        <img
                          className="h-12 w-12 rounded-lg object-cover mr-3"
                          src={post.images[0]}
                          alt=""
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                          <span className="text-gray-400 text-xl">📷</span>
                        </div>
                      )}
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {post.title || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {post.description?.substring(0, 50) || "No description"}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {post.author?.name || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {post.author?.email || ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.isActive !== false
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {post.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDealStatusBadgeColor(
                        post.dealStatus
                      )}`}
                    >
                      {post.dealStatus || "available"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="flex items-center">
                      <span className="mr-1">❤️</span>
                      {post.likesCount || post.likes?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="flex items-center">
                      <span className="mr-1">🔓</span>
                      {post.unlocksCount || post.unlocks?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="flex items-center">
                      <span className="mr-1">💬</span>
                      {post.commentsCount || post.comments?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => openDetailModal(post)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleToggleStatus(post._id, post.isActive !== false)}
                      className={
                        post.isActive !== false
                          ? "text-red-600 hover:text-red-900"
                          : "text-green-600 hover:text-green-900"
                      }
                    >
                      {post.isActive !== false ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Post Details</h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedPost(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Images Gallery */}
                {selectedPost.images && selectedPost.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {selectedPost.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500">Title</p>
                  <p className="text-lg font-semibold">{selectedPost.title || "N/A"}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-700">{selectedPost.description || "N/A"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Post ID</p>
                    <p className="font-mono text-sm">{selectedPost._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedPost.isActive !== false
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedPost.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Author</p>
                    <p className="font-medium">{selectedPost.author?.name || "N/A"}</p>
                    <p className="text-sm text-gray-500">{selectedPost.author?.email || ""}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Deal Status</p>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDealStatusBadgeColor(
                        selectedPost.dealStatus
                      )}`}
                    >
                      {selectedPost.dealStatus || "available"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p>{selectedPost.category || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p>{selectedPost.price ? `$${selectedPost.price}` : "N/A"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-500">
                      {selectedPost.likesCount || selectedPost.likes?.length || 0}
                    </p>
                    <p className="text-sm text-gray-500">Likes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-500">
                      {selectedPost.unlocksCount || selectedPost.unlocks?.length || 0}
                    </p>
                    <p className="text-sm text-gray-500">Unlocks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">
                      {selectedPost.commentsCount || selectedPost.comments?.length || 0}
                    </p>
                    <p className="text-sm text-gray-500">Comments</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p>{formatDate(selectedPost.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Updated</p>
                    <p>{formatDate(selectedPost.updatedAt)}</p>
                  </div>
                </div>

                {selectedPost.location && (
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p>{selectedPost.location}</p>
                  </div>
                )}

                {selectedPost.tags && selectedPost.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPost.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => handleToggleStatus(selectedPost._id, selectedPost.isActive !== false)}
                  className={`px-4 py-2 rounded-lg ${
                    selectedPost.isActive !== false
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {selectedPost.isActive !== false ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedPost(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostsManagement;
