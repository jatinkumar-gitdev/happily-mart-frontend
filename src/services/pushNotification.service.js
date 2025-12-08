import axios from "../api/axios.config";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const pushNotificationService = {
  isSupported: () => {
    return "serviceWorker" in navigator && "PushManager" in window;
  },

  async registerServiceWorker() {
    if (!this.isSupported()) return null;
    
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      console.log("Service Worker registered:", registration.scope);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  },

  async requestPermission() {
    if (!this.isSupported()) return "denied";
    const permission = await Notification.requestPermission();
    return permission;
  },

  async getSubscription() {
    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
  },

  async subscribe() {
    try {
      const permission = await this.requestPermission();
      if (permission !== "granted") {
        throw new Error("Notification permission denied");
      }

      const registration = await navigator.serviceWorker.ready;
      
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      const response = await axios.post("/api/notifications/subscribe", {
        subscription: subscription.toJSON(),
      });

      return response.data;
    } catch (error) {
      console.error("Push subscription error:", error);
      throw error;
    }
  },

  async unsubscribe() {
    try {
      const subscription = await this.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await axios.post("/api/notifications/unsubscribe", {
          endpoint: subscription.endpoint,
        });
      }
      return true;
    } catch (error) {
      console.error("Push unsubscription error:", error);
      throw error;
    }
  },
};
