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
    verifyAdminToken,
    syncWithCookies,
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
      // Sync with cookies first
      syncWithCookies();
      
      // Always attempt server-side verification. This ensures support for
      // httpOnly cookies that cannot be read by JS but are sent to the
      // backend with `withCredentials: true`.
      const verified = await verifyAdminToken({ getProfile: () => adminAxios.get("/auth/me") });
      return verified;
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
    setAdminAuth,
    verifyAdminToken,
    syncWithCookies,
  };
};