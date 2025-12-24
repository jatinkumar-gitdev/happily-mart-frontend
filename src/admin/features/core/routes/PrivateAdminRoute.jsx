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
      // Always attempt to verify with backend. This allows support for
      // httpOnly cookies (which are not readable via JS) and prevents
      // redirecting to login on page refresh when the cookie exists but
      // cannot be accessed by `js-cookie`.
      try {
        const response = await adminAxios.get("/auth/me");
        if (response.data?.user?.role === "admin") {
          setAdminAuth(response.data.user);
        } else {
          adminLogout();
        }
      } catch (error) {
        // If backend verification fails, clear auth
        adminLogout();
      } finally {
        // Add a small delay to show the loader
        setTimeout(() => {
          setIsVerifying(false);
        }, 500);
      }
    };

    // Run only on mount. Removing `adminUser` from the dependency array
    // prevents an update loop where `setAdminAuth` changes `adminUser`,
    // which would re-trigger this effect.
    verifyAdmin();
  }, []);

  if (isVerifying) {
    return <AdminLoader />;
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateAdminRoute;