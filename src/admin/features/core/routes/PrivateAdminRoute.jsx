import { Navigate, useLocation } from "react-router-dom";
import { useAdminStore } from "../../../../store/adminStore";
import { useEffect, useState } from "react";
import adminAxios from "../utils/adminAxios";
import AdminLoader from "../components/AdminLoader";
import { adminCookieManager } from "../../../../utils/adminCookieManager";

const PrivateAdminRoute = ({ children }) => {
  const location = useLocation();
  const {
    isAdminAuthenticated,
    adminUser,
    setAdminAuth,
    adminLogout,
    initializeAuth,
  } = useAdminStore();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      // First check if we have a token in cookies
      const token = adminCookieManager.getAccessToken();
      
      if (!token) {
        setIsVerifying(false);
        return;
      }

      try {
        // Verify token with backend
        const response = await adminAxios.get("/auth/me");
        if (response.data?.user?.role === "admin") {
          setAdminAuth(response.data.user);
        } else {
          adminLogout();
        }
      } catch (error) {
        adminLogout();
      } finally {
        // Add a small delay to show the loader
        setTimeout(() => {
          setIsVerifying(false);
        }, 1000);
      }
    };

    verifyAdmin();
  }, [adminUser]); // Add adminUser as dependency to re-run when it changes

  if (isVerifying) {
    return <AdminLoader />;
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateAdminRoute;