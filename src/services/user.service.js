import axiosInstance from "../api/axios.config";
import { API_ENDPOINTS } from "../api/endpoints";
import { showError } from "../utils/toast";

export const userService = {
  getProfile: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.USER.PROFILE);
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Failed to fetch profile");
      throw error;
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.USER.UPDATE_PROFILE,
        data
      );
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update profile");
      throw error;
    }
  },

  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await axiosInstance.post(
        API_ENDPOINTS.USER.UPLOAD_AVATAR,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Failed to upload avatar");
      throw error;
    }
  },

  setPresetAvatar: async (preset) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.USER.SET_PRESET_AVATAR,
        { preset }
      );

      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Failed to set preset avatar");
      throw error;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.USER.CHANGE_PASSWORD,
        { currentPassword, newPassword }
      );
      return response.data;
    } catch (error) {
      showError(error.response?.data?.message || "Failed to change password");
      throw error;
    }
  },

  requestAccountDeletion: async (password) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.USER.REQUEST_ACCOUNT_DELETION,
        { password }
      );
      return response.data;
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to request account deletion"
      );
      throw error;
    }
  },

  cancelAccountDeletion: async () => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.USER.CANCEL_ACCOUNT_DELETION
      );
      return response.data;
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to cancel account deletion"
      );
      throw error;
    }
  },

  deactivateAccount: async (password, reason) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.USER.DEACTIVATE_ACCOUNT,
        { password, reason }
      );
      return response.data;
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to deactivate account"
      );
      throw error;
    }
  },

  getAccountStatus: async () => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.USER.GET_ACCOUNT_STATUS
      );
      return response.data;
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to fetch account status"
      );
      throw error;
    }
  },

  forgotPasswordForDeletion: async (email) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.USER.FORGOT_PASSWORD_DELETION,
        { email }
      );
      return response.data;
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to send password reset email"
      );
      throw error;
    }
  },

  requestAccountReactivation: async (email) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.USER.REQUEST_REACTIVATION,
        { email }
      );
      return response.data;
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Failed to request account reactivation"
      );
      throw error;
    }
  },

  verifyReactivationToken: async (token) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.USER.VERIFY_REACTIVATION,
        { token }
      );
      return response.data;
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to verify reactivation token"
      );
      throw error;
    }
  },

  verifyEmailChange: async (token) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.USER.VERIFY_EMAIL_CHANGE,
        { token }
      );
      return response.data;
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to verify email change"
      );
      throw error;
    }
  },
};
