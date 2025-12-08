import { useEffect, useState } from "react";
import { pushNotificationService } from "../services/pushNotification.service";
import { useAuthStore } from "../store/authStore";

export const usePushNotifications = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState("default");
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const checkSupport = async () => {
      const supported = pushNotificationService.isSupported();
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
        
        const subscription = await pushNotificationService.getSubscription();
        setIsSubscribed(!!subscription);
      }
    };

    checkSupport();
  }, []);

  useEffect(() => {
    if (isAuthenticated && isSupported && !isSubscribed) {
      pushNotificationService.registerServiceWorker();
    }
  }, [isAuthenticated, isSupported, isSubscribed]);

  const subscribe = async () => {
    try {
      await pushNotificationService.subscribe();
      setIsSubscribed(true);
      setPermission("granted");
      return true;
    } catch (error) {
      console.error("Failed to subscribe:", error);
      return false;
    }
  };

  const unsubscribe = async () => {
    try {
      await pushNotificationService.unsubscribe();
      setIsSubscribed(false);
      return true;
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      return false;
    }
  };

  return {
    isSubscribed,
    isSupported,
    permission,
    subscribe,
    unsubscribe,
  };
};
