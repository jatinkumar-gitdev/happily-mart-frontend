import axiosInstance from "../api/axios.config";
import { API_ENDPOINTS } from "../api/endpoints";
import { showError } from "../utils/toast";

export const authService = {
  signup: async (data) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.AUTH.SIGNUP,
        data
      );
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Failed to sign up");
      throw error;
    }
  },

  sendOTP: async (email) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.SEND_OTP, {
        email,
      });
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Failed to send OTP");
      throw error;
    }
  },

  verifyOTP: async (email, otp) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_OTP, {
        email,
        otp,
      });
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Failed to verify OTP");
      throw error;
    }
  },

  login: async (email, password, rememberMe = false, recaptchaToken = null) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
        rememberMe,
        recaptchaToken,
      });
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Failed to login");
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        {
          email,
        }
      );
      return response.data;
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to send password reset email"
      );
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        {
          token,
          password,
        }
      );
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Failed to reset password");
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Failed to logout");
      throw error;
    }
  },

  getMe: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AUTH.ME);
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Failed to fetch user data");
      throw error;
    }
  },
};
