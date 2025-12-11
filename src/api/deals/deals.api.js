import axiosInstance from "../axios.config";
import { API_ENDPOINTS } from "../endpoints";

// User Deals API
export const dealsApi = {
  // Get user's deals workspace and history
  getUserDealsWorkspace: () => {
    return axiosInstance.get(API_ENDPOINTS.USER.GET_DEALS_WORKSPACE);
  },

  // Get user deals (both as unlocker and author)
  getUserDeals: (params = {}) => {
    return axiosInstance.get(API_ENDPOINTS.DEALS.GET_USER_DEALS, { params });
  },

  // Get a specific deal by ID
  getDealById: (id) => {
    return axiosInstance.get(API_ENDPOINTS.DEALS.GET_BY_ID(id));
  },

  // Update deal status
  updateDealStatus: (id, data) => {
    return axiosInstance.put(API_ENDPOINTS.DEALS.UPDATE_STATUS(id), data);
  },

  // Get deal statistics
  getDealStats: () => {
    return axiosInstance.get(API_ENDPOINTS.DEALS.GET_STATS);
  },

  // Get deal notifications
  getDealNotifications: () => {
    return axiosInstance.get(API_ENDPOINTS.DEALS.GET_NOTIFICATIONS);
  },

  // Mark notification as read
  markNotificationAsRead: (notificationId) => {
    return axiosInstance.put(API_ENDPOINTS.DEALS.MARK_NOTIFICATION_READ(notificationId));
  },

  // Get user's posts with deal statistics
  getUserPostsStats: (page = 1, limit = 10, status = "all") => {
    return axiosInstance.get(API_ENDPOINTS.USER.GET_POSTS_STATS, {
      params: { page, limit, status },
    });
  },

  // Update deal toggle status (Won/Failed/Pending)
  updateDealToggleStatus: (postId, dealToggleStatus) => {
    return axiosInstance.put(API_ENDPOINTS.POSTS.UPDATE_DEAL_TOGGLE(postId), { dealToggleStatus });
  },
};

// Admin Deals API
export const adminDealsApi = {
  // Get all deals (admin)
  getAllDeals: (params = {}) => {
    return axiosInstance.get(API_ENDPOINTS.ADMIN_DEALS.GET_ALL, { params });
  },

  // Get a specific deal by ID (admin)
  getDealById: (id) => {
    return axiosInstance.get(API_ENDPOINTS.ADMIN_DEALS.GET_BY_ID(id));
  },

  // Update deal status (admin)
  updateDealStatus: (id, data) => {
    return axiosInstance.put(API_ENDPOINTS.ADMIN_DEALS.UPDATE_STATUS(id), data);
  },

  // Close a deal (admin)
  closeDeal: (id) => {
    return axiosInstance.delete(API_ENDPOINTS.ADMIN_DEALS.CLOSE(id));
  },

  // Get deal analytics (admin)
  getDealAnalytics: () => {
    return axiosInstance.get(API_ENDPOINTS.ADMIN_ANALYTICS.DEALS);
  },
};