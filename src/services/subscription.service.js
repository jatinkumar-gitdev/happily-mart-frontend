import axiosInstance from "../api/axios.config";
import { API_ENDPOINTS } from "../api/endpoints";
import { showError } from "../utils/toast";

export const subscriptionService = {
  // Get all subscription plans
  getPlans: async () => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.SUBSCRIPTIONS.GET_PLANS
      );
      return response.data;
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to fetch subscription plans"
      );
      throw error;
    }
  },

  // Get user's current subscription
  getMySubscription: async () => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.SUBSCRIPTIONS.MY_SUBSCRIPTION
      );
      return response.data;
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to fetch subscription details"
      );
      throw error;
    }
  },

  // Create subscription order
  createOrder: async (planName, currency = "INR") => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.SUBSCRIPTIONS.CREATE_ORDER,
        {
          planName,
          currency,
        }
      );
      return response.data;
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to create subscription order"
      );
      throw error;
    }
  },

  // Verify subscription payment
  verifyPayment: async (paymentData) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.SUBSCRIPTIONS.VERIFY,
        paymentData
      );
      return response.data;
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to verify subscription payment"
      );
      throw error;
    }
  },

  // Get subscription history
  getHistory: async () => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.SUBSCRIPTIONS.HISTORY
      );
      return response.data;
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to fetch subscription history"
      );
      throw error;
    }
  },

  // Use credit for unlocking post
  useCredit: async (postId) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.SUBSCRIPTIONS.USE_CREDIT,
        {
          postId,
        }
      );
      return response.data;
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Failed to use credit for unlocking post"
      );
      throw error;
    }
  },
};
