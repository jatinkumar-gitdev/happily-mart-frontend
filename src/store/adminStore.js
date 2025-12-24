import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adminCookieManager } from "../utils/adminCookieManager";
import adminAxios from "../admin/features/core/utils/adminAxios";

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

      initializeAuth: async () => {
        // Attempt to initialize auth by verifying with backend. This
        // supports httpOnly cookies that cannot be read by JS.
        try {
          const response = await adminAxios.get("/auth/me");
          if (response?.data?.user?.role === "admin") {
            set({ adminUser: response.data.user, isAdminAuthenticated: true });
            return true;
          }
          // Not an admin or invalid response
          get().adminLogout();
          return false;
        } catch (error) {
          // If verification failed, clear any stale state
          get().adminLogout();
          return false;
        }
      },
      
      verifyAdminToken: async (adminAuthAPI) => {
        const token = adminCookieManager.getAccessToken();
        
        if (!token) {
          set({
            adminUser: null,
            isAdminAuthenticated: false,
          });
          return false;
        }
        
        try {
          const response = await adminAuthAPI.getProfile();
          if (response?.data?.user?.role === "admin") {
            set({
              adminUser: response.data.user,
              isAdminAuthenticated: true,
            });
            return true;
          } else {
            // Token is invalid or user is not admin
            get().adminLogout();
            return false;
          }
        } catch (error) {
          console.error("Failed to verify admin token:", error);
          get().adminLogout();
          return false;
        }
      },
      
      // New method to sync state with actual cookies immediately
      syncWithCookies: () => {
        const token = adminCookieManager.getAccessToken();
        
        if (token) {
          // Token exists in cookies, ensure auth state is true
          if (!get().isAdminAuthenticated) {
            set({ isAdminAuthenticated: true });
          }
        } else {
          // No token in cookies, ensure auth state is false
          if (get().isAdminAuthenticated) {
            set({ 
              adminUser: null,
              isAdminAuthenticated: false 
            });
          }
        }
      }
    }),
    {
      name: "admin-storage",
      partialize: (state) => ({
        // Persist both authentication status and user data
        adminUser: state.adminUser,
        isAdminAuthenticated: state.isAdminAuthenticated,
      }),
    }
  )
);

export { useAdminStore };