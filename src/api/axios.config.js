import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8800/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const isAdminRequest = config.url.includes("/admin/");
    
    if (isAdminRequest) {
      let token = Cookies.get("adminToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      let token = Cookies.get("accessToken");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    config.headers["X-Requested-With"] = "XMLHttpRequest";
    config.headers["X-Content-Type-Options"] = "nosniff";

    if (["post", "put", "delete"].includes(config.method)) {
      config.headers["X-Request-Time"] = Date.now().toString();
      config.headers["X-Request-ID"] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const isAdminRequest = originalRequest.url.includes("/admin/");

      try {
        const response = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;

        if (isAdminRequest) {
          // For admin requests, use admin cookie manager
          const rememberMe = Cookies.get("adminRememberMe") === "true";
          Cookies.set("adminToken", accessToken, {
            expires: rememberMe ? 30 : 1,
            secure: import.meta.env.MODE === "production",
            sameSite: "lax",
            path: "/",
          });
        } else {
          // For regular user requests, use the access token cookie
          const rememberMe = localStorage.getItem("rememberMePreference") === "true";
          Cookies.set("accessToken", accessToken, {
            expires: rememberMe ? 30 : 1,
            secure: import.meta.env.MODE === "production",
            sameSite: "lax",
            path: "/",
          });
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        if (isAdminRequest) {
          Cookies.remove("adminToken", { path: "/" });
          Cookies.remove("adminRefreshToken", { path: "/" });
          window.location.href = "/admin/login";
        } else {
          localStorage.removeItem("rememberMePreference");
          localStorage.removeItem("auth-storage");
          sessionStorage.clear();
          Cookies.remove("accessToken", { path: "/" });
          Cookies.remove("refreshToken", { path: "/" });
          const currentPath = window.location.pathname;
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
      error.message = error.response?.data?.message || "Access denied";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;