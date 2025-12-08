import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "../api/axios.config";

const useDealStore = create(
  persist(
    (set, get) => ({
      // Deal state
      deals: [],
      currentDeal: null,
      loading: false,
      error: null,
      
      // Notifications
      notifications: [],
      unreadNotifications: 0,
      
      // Stats
      dealStats: {
        Contacted: 0,
        Ongoing: 0,
        Success: 0,
        Fail: 0,
        Closed: 0,
      },
      
      // Actions
      setDeals: (deals) => set({ deals }),
      setCurrentDeal: (deal) => set({ currentDeal: deal }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setNotifications: (notifications) => set({ 
        notifications,
        unreadNotifications: notifications.filter(n => !n.isRead).length
      }),
      
      // Fetch user deals
      fetchUserDeals: async (filters = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await axios.get('/deals', { params: filters });
          set({ deals: response.data.deals });
          return response.data;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to fetch deals' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      
      // Fetch a specific deal
      fetchDealById: async (id) => {
        try {
          set({ loading: true, error: null });
          const response = await axios.get(`/deals/${id}`);
          set({ currentDeal: response.data.deal });
          return response.data.deal;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to fetch deal' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      
      // Update deal status
      updateDealStatus: async (id, status, notes = '') => {
        try {
          set({ loading: true, error: null });
          const response = await axios.put(`/deals/${id}/status`, {
            status,
            notes
          });
          
          // Update local state
          const updatedDeal = response.data.deal;
          set(state => ({
            currentDeal: updatedDeal,
            deals: state.deals.map(deal => 
              deal._id === id ? updatedDeal : deal
            )
          }));
          
          return response.data;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to update deal status' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      
      // Fetch deal stats
      fetchDealStats: async () => {
        try {
          set({ loading: true, error: null });
          const response = await axios.get('/deals/stats');
          set({ dealStats: response.data.stats });
          return response.data;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to fetch deal stats' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      
      // Fetch notifications
      fetchNotifications: async () => {
        try {
          const response = await axios.get('/deals/notifications');
          set({ 
            notifications: response.data.notifications,
            unreadNotifications: response.data.notifications.filter(n => !n.isRead).length
          });
          return response.data;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to fetch notifications' });
          throw error;
        }
      },
      
      // Mark notification as read
      markNotificationAsRead: async (notificationId) => {
        try {
          await axios.put(`/deals/notifications/${notificationId}/read`);
          set(state => ({
            notifications: state.notifications.map(notification =>
              notification._id === notificationId
                ? { ...notification, isRead: true }
                : notification
            ),
            unreadNotifications: state.unreadNotifications - 1
          }));
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to mark notification as read' });
          throw error;
        }
      },
      
      // Reset store
      reset: () => set({
        deals: [],
        currentDeal: null,
        loading: false,
        error: null,
        notifications: [],
        unreadNotifications: 0,
        dealStats: {
          Contacted: 0,
          Ongoing: 0,
          Success: 0,
          Fail: 0,
          Closed: 0,
        },
      }),
    }),
    {
      name: "deal-storage",
      partialize: (state) => ({
        deals: state.deals,
        dealStats: state.dealStats,
        notifications: state.notifications,
        unreadNotifications: state.unreadNotifications,
      }),
    }
  )
);

export { useDealStore };