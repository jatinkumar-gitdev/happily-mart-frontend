import axios from "axios";
import { adminCookieManager } from "../../../../utils/adminCookieManager";

const ADMIN_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8800/api";

const adminAxios = axios.create({
  baseURL: ADMIN_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

adminAxios.interceptors.request.use(
  (config) => {
    const isLoginRequest = config.url.includes("/auth/login");
    
    if (!isLoginRequest) {
      const token = adminCookieManager.getAccessToken();
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
  (error) => {
    return Promise.reject(error);
  }
);

adminAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${ADMIN_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;
        // Get rememberMe preference from cookie
        const rememberMe = adminCookieManager.getRefreshToken() === "true";
        
        adminCookieManager.setAccessToken(accessToken, rememberMe);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return adminAxios(originalRequest);
      } catch (refreshError) {
        adminCookieManager.removeAll();
        window.location.href = "/admin/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default adminAxios;