import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dealsApi, adminDealsApi } from "./deals.api";

// User Deals Hooks
export const useUserDeals = (params = {}) => {
  return useQuery({
    queryKey: ["userDeals", params],
    queryFn: () => dealsApi.getUserDeals(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDealById = (id) => {
  return useQuery({
    queryKey: ["deal", id],
    queryFn: () => dealsApi.getDealById(id),
    enabled: !!id,
  });
};

export const useUpdateDealStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => dealsApi.updateDealStatus(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch deal data
      queryClient.invalidateQueries(["deal", variables.id]);
      queryClient.invalidateQueries(["userDeals"]);
    },
  });
};

export const useDealStats = () => {
  return useQuery({
    queryKey: ["dealStats"],
    queryFn: () => dealsApi.getDealStats(),
  });
};

export const useDealNotifications = () => {
  return useQuery({
    queryKey: ["dealNotifications"],
    queryFn: () => dealsApi.getDealNotifications(),
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId) => dealsApi.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries(["dealNotifications"]);
    },
  });
};

// Admin Deals Hooks
export const useAdminDeals = (params = {}) => {
  return useQuery({
    queryKey: ["adminDeals", params],
    queryFn: () => adminDealsApi.getAllDeals(params),
  });
};

export const useAdminDealById = (id) => {
  return useQuery({
    queryKey: ["adminDeal", id],
    queryFn: () => adminDealsApi.getDealById(id),
    enabled: !!id,
  });
};

export const useAdminUpdateDealStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => adminDealsApi.updateDealStatus(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch deal data
      queryClient.invalidateQueries(["adminDeal", variables.id]);
      queryClient.invalidateQueries(["adminDeals"]);
    },
  });
};

export const useAdminCloseDeal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => adminDealsApi.closeDeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminDeals"]);
    },
  });
};

export const useAdminDealAnalytics = () => {
  return useQuery({
    queryKey: ["adminDealAnalytics"],
    queryFn: () => adminDealsApi.getDealAnalytics(),
  });
};