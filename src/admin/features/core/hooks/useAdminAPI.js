import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  adminAuthAPI, 
  adminUserAPI, 
  adminPostAPI, 
  adminDealAPI, 
  adminAnalyticsAPI 
} from "../../../../services/admin.service";

// Admin Auth Hooks
export const useAdminLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminAuthAPI.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
    }
  });
};

export const useAdminLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminAuthAPI.logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["admin-profile"] });
      queryClient.removeQueries({ queryKey: ["admin-users"] });
      queryClient.removeQueries({ queryKey: ["admin-posts"] });
      queryClient.removeQueries({ queryKey: ["admin-deals"] });
      queryClient.removeQueries({ queryKey: ["admin-analytics"] });
    }
  });
};

export const useAdminProfile = (options = {}) => {
  return useQuery({
    queryKey: ["admin-profile"],
    queryFn: adminAuthAPI.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
};

// Admin User Management Hooks
export const useAdminUsers = (params, options = {}) => {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => adminUserAPI.getAllUsers(params),
    ...options
  });
};

export const useAdminUserById = (id, options = {}) => {
  return useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => adminUserAPI.getUserById(id),
    enabled: !!id,
    ...options
  });
};

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => adminUserAPI.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user", variables.id] });
    }
  });
};

export const useDeactivateAdminUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => adminUserAPI.deactivateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    }
  });
};

// Admin Post Management Hooks
export const useAdminPosts = (params, options = {}) => {
  return useQuery({
    queryKey: ["admin-posts", params],
    queryFn: () => adminPostAPI.getAllPosts(params),
    ...options
  });
};

export const useAdminPostById = (id, options = {}) => {
  return useQuery({
    queryKey: ["admin-post", id],
    queryFn: () => adminPostAPI.getPostById(id),
    enabled: !!id,
    ...options
  });
};

export const useUpdateAdminPostStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => adminPostAPI.updatePostStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-post", variables.id] });
    }
  });
};

// Admin Deal Management Hooks
export const useAdminDeals = (params, options = {}) => {
  return useQuery({
    queryKey: ["admin-deals", params],
    queryFn: () => adminDealAPI.getAllDeals(params),
    ...options
  });
};

export const useAdminDealById = (id, options = {}) => {
  return useQuery({
    queryKey: ["admin-deal", id],
    queryFn: () => adminDealAPI.getDealById(id),
    enabled: !!id,
    ...options
  });
};

export const useUpdateAdminDealStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => adminDealAPI.updateDealStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-deals"] });
      queryClient.invalidateQueries({ queryKey: ["admin-deal", variables.id] });
    }
  });
};

export const useCloseAdminDeal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => adminDealAPI.closeDeal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-deals"] });
    }
  });
};

// Admin Analytics Hooks
export const useAdminDealAnalytics = (options = {}) => {
  return useQuery({
    queryKey: ["admin-analytics", "deals"],
    queryFn: adminAnalyticsAPI.getDealAnalytics,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options
  });
};

export const useAdminRecentActivity = (params, options = {}) => {
  return useQuery({
    queryKey: ["admin-analytics", "activity", params],
    queryFn: () => adminAnalyticsAPI.getRecentActivity(params),
    ...options
  });
};