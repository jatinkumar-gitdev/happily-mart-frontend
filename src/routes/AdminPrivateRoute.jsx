import { Navigate } from "react-router-dom";
import { useAdminStore } from "../store/adminStore";
import { useEffect, useState } from "react";
import { adminAuthAPI } from "../services/admin.service";

const AdminPrivateRoute = ({ children }) => {
  const { syncWithCookies, verifyAdminToken, isAdminAuthenticated, adminUser } = useAdminStore();
  const [loading, setLoading] = useState(true);

  // Initialize auth state and verify token when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      // First, sync the store state with actual cookies to override any outdated persisted state
      syncWithCookies();
      
      // If there's a token in cookies, verify it with the backend
      if (isAdminAuthenticated) {
        await verifyAdminToken(adminAuthAPI);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, [syncWithCookies, verifyAdminToken, isAdminAuthenticated]);

  if (loading) {
    // You can return a loading component here if desired
    return <div>Loading...</div>;
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminPrivateRoute;