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
};
