import axiosInstance from "../api/axios.config";
import { API_ENDPOINTS } from "../api/endpoints";
import { showError } from "../utils/toast";

export const paymentService = {
  createOrder: async (postId, amount) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.PAYMENTS.CREATE_ORDER,
        { postId },
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to create payment order"
      );
      throw error;
    }
  },

  verifyPayment: async (paymentData) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.PAYMENTS.VERIFY,
        paymentData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Failed to verify payment");
      throw error;
    }
  },

  getPaymentHistory: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.PAYMENTS.HISTORY);
      return response.data;
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to fetch payment history"
      );
      throw error;
    }
  },
};
