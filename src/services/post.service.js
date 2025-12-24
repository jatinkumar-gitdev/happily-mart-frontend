import axiosInstance from "../api/axios.config";
import { API_ENDPOINTS } from "../api/endpoints";
import { showError } from "../utils/toast";

export const postService = {
  createPost: async (data) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.POSTS.CREATE,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Failed to create post");
      throw error;
    }
  },

  getPosts: async (params = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.POSTS.GET_ALL, {
      params,
    });
    return response.data;
  },

  getMyPosts: async (params = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.POSTS.GET_ALL, {
      params: { ...params, author: 'me' },
    });
    return response.data;
  },

  getFavoritePosts: async (params = {}) => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.POSTS.GET_FAVORITES,
      {
        params,
      }
    );
    return response.data;
  },

  getPublicPosts: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.POSTS.GET_PUBLIC);
    return response.data;
  },

  getPostById: async (id) => {
    const response = await axiosInstance.get(API_ENDPOINTS.POSTS.GET_BY_ID(id));
    return response.data;
  },

  likePost: async (id) => {
    const response = await axiosInstance.post(API_ENDPOINTS.POSTS.LIKE(id));
    return response.data;
  },

  favoritePost: async (id) => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.POSTS.FAVORITE(id)
    );
    return response.data;
  },

  sharePost: async (id) => {
    const response = await axiosInstance.post(API_ENDPOINTS.POSTS.SHARE(id));
    return response.data;
  },

  addComment: async (id, text) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.POSTS.ADD_COMMENT(id),
        { text }
      );
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Failed to add comment");
      throw error;
    }
  },

  getComments: async (id) => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.POSTS.GET_COMMENTS(id)
    );
    return response.data;
  },

  searchPosts: async (query, params = {}) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.POSTS.SEARCH, {
        params: { q: query, ...params },
      });
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Failed to search posts");
      throw error;
    }
  },

  unlockPost: async (id) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.POSTS.UNLOCK(id));
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Failed to unlock post");
      throw error;
    }
  },

  updateDealToggleStatus: async (id, dealToggleStatus) => {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.POSTS.UPDATE_DEAL_TOGGLE(id), { dealToggleStatus });
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update deal toggle status");
      throw error;
    }
  },

  updatePostValidity: async (id, validityPeriod) => {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.POSTS.UPDATE_VALIDITY(id), { validityPeriod });
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update post validity");
      throw error;
    }
  },

  getValidityOptions: async (id) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.POSTS.GET_VALIDITY_OPTIONS(id));
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Failed to fetch validity options");
      throw error;
    }
  },

  // Add new method for incrementing view count
  incrementViewCount: async (id) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.POSTS.INCREMENT_VIEW_COUNT(id));
      return response.data;
    } catch (error) {
      // We don't show an error for view count increment failures as it's not critical
      console.error("Failed to increment view count:", error);
      return { success: false, message: "Failed to increment view count" };
    }
  },

  // Add new method for editing a post
  editPost: async (id, data) => {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.POSTS.EDIT(id), data);
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Failed to edit post");
      throw error;
    }
  },
};