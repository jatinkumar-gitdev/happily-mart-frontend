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
      let token = localStorage.getItem("adminToken") || Cookies.get("adminToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      const isRemembered = localStorage.getItem("rememberMe") === "true";
      const storage = isRemembered ? localStorage : sessionStorage;
      let token = storage.getItem("authToken") || Cookies.get("accessToken");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        if (!storage.getItem("authToken")) {
          storage.setItem("authToken", token);
        }
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
          const isRemembered = localStorage.getItem("adminRememberMe") === "true";
          Cookies.set("adminToken", accessToken, {
            expires: isRemembered ? 30 : 1,
            secure: import.meta.env.MODE === "production",
            sameSite: "strict",
            path: "/",
          });
          if (isRemembered) {
            localStorage.setItem("adminToken", accessToken);
          }
        } else {
          const isRemembered = localStorage.getItem("rememberMe") === "true";
          const storage = isRemembered ? localStorage : sessionStorage;
          storage.setItem("authToken", accessToken);
          Cookies.set("accessToken", accessToken, {
            expires: isRemembered ? 30 : 1,
            secure: import.meta.env.MODE === "production",
            sameSite: "strict",
          });
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        if (isAdminRequest) {
          Cookies.remove("adminToken", { path: "/" });
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminRememberMe");
          localStorage.removeItem("adminUser");
          window.location.href = "/admin/login";
        } else {
          localStorage.removeItem("authToken");
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("auth-storage");
          sessionStorage.clear();
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
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