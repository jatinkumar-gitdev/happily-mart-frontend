import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adminCookieManager } from "../utils/adminCookieManager";

const useAdminStore = create(
  persist(
    (set, get) => ({
      adminUser: null,
      isAdminAuthenticated: false,
      adminNotifications: [],
      unreadAdminNotifications: 0,
      isLoading: false,

      setAdminAuth: (user) => {
        set({
          adminUser: user,
          isAdminAuthenticated: true,
        });
      },

      adminLogout: () => {
        adminCookieManager.removeAll();
        set({
          adminUser: null,
          isAdminAuthenticated: false,
          adminNotifications: [],
          unreadAdminNotifications: 0,
        });
      },

      setAdminNotifications: (notifications) =>
        set({
          adminNotifications: notifications,
          unreadAdminNotifications: notifications.filter((n) => !n.isRead).length,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      initializeAuth: () => {
        const token = adminCookieManager.getAccessToken();
        
        if (!token) {
          set({
            adminUser: null,
            isAdminAuthenticated: false,
          });
          return false;
        }

        // In a production app, we should verify the token with the backend
        // But for now, we're assuming if there's a token, the user is authenticated
        set({
          isAdminAuthenticated: true,
        });
        return true;
      },
    }),
    {
      name: "admin-storage",
      partialize: (state) => ({
        // We don't persist user data since it comes from cookies
        isAdminAuthenticated: state.isAdminAuthenticated,
      }),
    }
  )
);

export { useAdminStore };