import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cookieManager } from "../utils/cookieManager";
import { authService } from "../services/auth.service";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: cookieManager.get("accessToken") || null,
      isAuthenticated: !!cookieManager.get("accessToken"),
      rememberMe: false,
      lastValidation: 0,
      refreshPromise: null,

      setAuth: (user, token, rememberMe = false) => {
        if (token) {
          const expiryDays = rememberMe ? 30 : 1;
          cookieManager.set("accessToken", token, { expires: expiryDays });
          
          // Store token in appropriate storage based on rememberMe
          if (rememberMe) {
            localStorage.setItem("authToken", token);
            localStorage.setItem("rememberMe", "true");
            sessionStorage.removeItem("authToken");
          } else {
            sessionStorage.setItem("authToken", token);
            localStorage.removeItem("authToken");
            localStorage.removeItem("rememberMe");
          }
        }
        localStorage.setItem("rememberMePreference", rememberMe ? "true" : "false");
        if (!rememberMe) {
          localStorage.removeItem("rememberedEmail");
        }
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
          rememberMe,
          lastValidation: Date.now(),
        });
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          cookieManager.clear();
          // Clear all storage
          localStorage.removeItem("authToken");
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("auth-storage");
          sessionStorage.removeItem("authToken");
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            rememberMe: false,
            lastValidation: 0,
            refreshPromise: null,
          });
        }
      },

      setUser: (user) => set({ user }),

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      // Refresh authentication state
      refreshAuth: async () => {
        try {
          const state = get();
          const now = Date.now();

          // Reuse cached validation if recent
          if (state.user && now - state.lastValidation < 60000) {
            return true;
          }

          // Reuse in-flight refresh
          if (state.refreshPromise) {
            return state.refreshPromise;
          }

          const refreshTask = (async () => {
            try {
              const rememberMe = localStorage.getItem("rememberMe") === "true";
              const storage = rememberMe ? localStorage : sessionStorage;
              let token = storage.getItem("authToken");

              if (!token) {
                token = cookieManager.get("accessToken");
              }

              if (!token) {
                await get().logout();
                return false;
              }

              const response = await authService.getMe();
              set({
                user: response.user,
                accessToken: token,
                isAuthenticated: true,
                rememberMe,
                lastValidation: Date.now(),
              });
              return true;
            } catch (error) {
              await get().logout();
              return false;
            } finally {
              set({ refreshPromise: null });
            }
          })();

          set({ refreshPromise: refreshTask });
          return refreshTask;
        } catch (error) {
          await get().logout();
          return false;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        rememberMe: state.rememberMe,
        user: state.rememberMe ? state.user : null,
      }),
    }
  )
);

export { useAuthStore };
