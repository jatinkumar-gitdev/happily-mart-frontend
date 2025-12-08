import { create } from "zustand";
import axios from "../api/axios.config";

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  hasMore: true,
  page: 1,

  fetchNotifications: async (page = 1, limit = 20) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get("/api/notifications", {
        params: { page, limit },
      });
      
      const newNotifications = page === 1 
        ? response.data.notifications 
        : [...get().notifications, ...response.data.notifications];
      
      set({
        notifications: newNotifications,
        unreadCount: response.data.unreadCount,
        hasMore: response.data.notifications.length === limit,
        page,
      });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to fetch notifications" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      await axios.put("/api/notifications/read-all");
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      set((state) => ({
        notifications: state.notifications.filter((n) => n._id !== notificationId),
      }));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  reset: () => set({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    hasMore: true,
    page: 1,
  }),
}));

export { useNotificationStore };
