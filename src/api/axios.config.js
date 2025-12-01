import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // First try to get from localStorage/sessionStorage (based on rememberMe)
    const isRemembered = localStorage.getItem("rememberMe") === "true";
    const storage = isRemembered ? localStorage : sessionStorage;
    let token = storage.getItem("authToken");

    // Fall back to cookie if not found in storage
    if (!token) {
      token = Cookies.get("accessToken");
      // If found in cookie, also store it in appropriate storage
      if (token) {
        if (isRemembered) {
          localStorage.setItem("authToken", token);
        } else {
          sessionStorage.setItem("authToken", token);
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add security headers
    config.headers["X-Requested-With"] = "XMLHttpRequest";
    config.headers["Content-Type"] = config.headers["Content-Type"] || "application/json";
    config.headers["X-Content-Type-Options"] = "nosniff";

    // Add timestamp to prevent replay attacks for sensitive operations
    if (config.method === "post" || config.method === "put" || config.method === "delete") {
      config.headers["X-Request-Time"] = Date.now().toString();
      
      // Add request ID for tracking and preventing duplicate requests
      config.headers["X-Request-ID"] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:8000/api"
          }/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;

        // Update token in appropriate storage
        const isRemembered = localStorage.getItem("rememberMe") === "true";
        const storage = isRemembered ? localStorage : sessionStorage;
        storage.setItem("authToken", accessToken);

        // Also update cookie with appropriate expiry
        Cookies.set("accessToken", accessToken, {
          expires: isRemembered ? 30 : 1,
        });

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Clear from all storages on refresh failure
        localStorage.removeItem("authToken");
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("auth-storage");
        sessionStorage.removeItem("authToken");
        sessionStorage.clear();
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        
        // Secure redirect to login
        const currentPath = window.location.pathname;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden (insufficient permissions)
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.message || "Access denied";
      // Preserve original error but ensure message is descriptive
      error.message = errorMessage;
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
