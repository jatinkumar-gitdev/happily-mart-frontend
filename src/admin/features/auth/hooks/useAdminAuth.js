import { useAdminStore } from "../../../../store/adminStore";
import adminAxios from "../../core/utils/adminAxios";
import { adminCookieManager } from "../../../../utils/adminCookieManager";

export const useAdminAuth = () => {
  const {
    adminUser,
    isAdminAuthenticated,
    isLoading,
    setAdminAuth,
    adminLogout,
    setLoading,
    initializeAuth,
  } = useAdminStore();

  const adminLogin = async (email, password, rememberMe = false) => {
    try {
      setLoading(true);
      
      const response = await adminAxios.post("/auth/login", {
        email,
        password,
        rememberMe,
        isAdmin: true,
      });

      if (!response.data || !response.data.user) {
        throw new Error("Invalid response from server");
      }

      if (response.data.user.role !== "admin") {
        throw new Error("Access denied. Admin privileges required.");
      }

      const { user, accessToken } = response.data;

      // Set admin token in cookie only (no localStorage)
      if (accessToken) {
        adminCookieManager.setAccessToken(accessToken, rememberMe);
      }

      // Store rememberMe preference in cookie
      adminCookieManager.setRefreshToken(rememberMe ? "true" : "false", true);

      setAdminAuth(user);
      return { success: true, user };
    } catch (error) {
      adminLogout();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyAdminAuth = async () => {
    try {
      const hasLocalAuth = initializeAuth();
      if (!hasLocalAuth) return false;

      const response = await adminAxios.get("/auth/me");
      if (response.data?.user?.role === "admin") {
        setAdminAuth(response.data.user);
        return true;
      }
      adminLogout();
      return false;
    } catch (error) {
      adminLogout();
      return false;
    }
  };

  return {
    adminUser,
    isAdminAuthenticated,
    isLoading,
    adminLogin,
    adminLogout,
    verifyAdminAuth,
    initializeAuth,
  };
};