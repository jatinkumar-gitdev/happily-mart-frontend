import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import { useThemeStore } from "./store/themeStore";
import { useAuthStore } from "./store/authStore";
import { useAdminStore } from "./store/adminStore";
import { authService } from "./services/auth.service";
import { cookieManager } from "./utils/cookieManager";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const { theme } = useThemeStore();
  const location = useLocation();
  const { setUser, logout } = useAuthStore();
  const { initializeAuth: initializeAdminAuth } = useAdminStore();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password";

  useEffect(() => {
    // Initialize admin auth state only once
    const isAdminRoute = location.pathname.startsWith("/admin");
    if (isAdminRoute) {
      initializeAdminAuth();
    }
    
    // Initialize user auth state
    const token = cookieManager.get("accessToken");
    if (token) {
      authService
        .getMe()
        .then((data) => {
          if (data?.user) {
            setUser(data.user);
          } else {
            logout();
          }
        })
        .catch((err) => {
          console.error("Failed to fetch current user:", err);
          logout();
        });
    }
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    const root = document.documentElement;

    if (isAuthPage) {
      root.classList.remove("dark");
    } else {
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [theme, isAuthPage]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" reverseOrder={false} />
      <AppRoutes />
    </QueryClientProvider>
  );
}

export default App;