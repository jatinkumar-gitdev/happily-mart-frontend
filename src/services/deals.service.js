import axios from "../api/axios.config";
import { API_ENDPOINTS } from "../api/endpoints";

export const dealsService = {
  // Get user's deals workspace and history
  getUserDealsWorkspace: async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.USER.GET_DEALS_WORKSPACE);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user's posts with deal statistics
  getUserPostsStats: async (page = 1, limit = 10, status = "all") => {
    try {
      const response = await axios.get(API_ENDPOINTS.USER.GET_POSTS_STATS, {
        params: { page, limit, status },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update deal toggle status (Won/Failed/Pending)
  updateDealToggleStatus: async (postId, dealToggleStatus) => {
    try {
      const response = await axios.put(
        API_ENDPOINTS.POSTS.UPDATE_DEAL_TOGGLE(postId),
        { dealToggleStatus }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update post validity
  updatePostValidity: async (postId, validityPeriod) => {
    try {
      const response = await axios.put(
        API_ENDPOINTS.POSTS.UPDATE_VALIDITY(postId),
        { validityPeriod }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get deal statistics
  getDealStats: async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.DEALS.GET_STATS);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all deals for user
  getUserDeals: async (page = 1, limit = 10, role = "author") => {
    try {
      const response = await axios.get(API_ENDPOINTS.DEALS.GET_USER_DEALS, {
        params: { page, limit, role },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update deal status
  updateDealStatus: async (dealId, status) => {
    try {
      const response = await axios.put(
        API_ENDPOINTS.DEALS.UPDATE_STATUS(dealId),
        { status }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
