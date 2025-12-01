import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

/**
 * RouteLogger - Logs route access for security monitoring
 * In production, this would send logs to a secure logging service
 */
const RouteLogger = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Log route access (only in development or with proper logging service)
    if (process.env.NODE_ENV === "development") {
      console.log("[Route Access]", {
        path: location.pathname,
        timestamp: new Date().toISOString(),
        authenticated: isAuthenticated,
        userId: user?._id || "anonymous",
        userAgent: navigator.userAgent,
      });
    }

    // In production, send to secure logging endpoint
    // This would be implemented with proper security measures
    if (process.env.NODE_ENV === "production" && isAuthenticated) {
      // Example: Send to secure logging API
      // fetch('/api/logs/route-access', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     path: location.pathname,
      //     timestamp: new Date().toISOString(),
      //     userId: user?._id
      //   })
      // }).catch(err => console.error('Logging error:', err));
    }
  }, [location.pathname, isAuthenticated, user]);

  return null; // This component doesn't render anything
};

export default RouteLogger;

