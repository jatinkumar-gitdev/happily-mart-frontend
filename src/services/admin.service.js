import adminAxios from "../admin/features/core/utils/adminAxios";

// Admin Auth Endpoints
export const adminAuthAPI = {
  login: (data) => adminAxios.post("/auth/login", { ...data, isAdmin: true }),
  logout: () => adminAxios.post("/auth/logout"),
  refreshToken: () => adminAxios.post("/auth/refresh-token"),
  getProfile: () => adminAxios.get("/auth/me"),
};

// Admin User Management Endpoints
export const adminUserAPI = {
  getAllUsers: (params) => adminAxios.get("/admin/users", { params }),
  getUserById: (id) => adminAxios.get(`/admin/users/${id}`),
  updateUser: (id, data) => adminAxios.put(`/admin/users/${id}`, data),
  deactivateUser: (id, data) => adminAxios.put(`/admin/users/${id}/deactivate`, data),
};

// Admin Post Management Endpoints
export const adminPostAPI = {
  getAllPosts: (params) => adminAxios.get("/admin/posts", { params }),
  getPostById: (id) => adminAxios.get(`/admin/posts/${id}`),
  updatePostStatus: (id, data) => adminAxios.put(`/admin/posts/${id}/status`, data),
};

// Admin Deal Management Endpoints
export const adminDealAPI = {
  getAllDeals: (params) => adminAxios.get("/admin/deals", { params }),
  getDealById: (id) => adminAxios.get(`/admin/deals/${id}`),
  updateDealStatus: (id, data) => adminAxios.put(`/admin/deals/${id}/status`, data),
  closeDeal: (id, data) => adminAxios.delete(`/admin/deals/${id}`, { data }),
};

// Admin Analytics Endpoints
export const adminAnalyticsAPI = {
  getDealAnalytics: () => adminAxios.get("/admin/analytics/deals"),
  getRecentActivity: (params) => adminAxios.get("/admin/analytics/activity", { params }),
};