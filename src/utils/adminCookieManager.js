import Cookies from "js-cookie";

const ADMIN_TOKEN_NAME = "adminToken";
const ADMIN_REFRESH_TOKEN_NAME = "adminRefreshToken";

const cookieOptions = {
  secure: import.meta.env.MODE === "production",
  sameSite: "lax",
  path: "/",
};

export const adminCookieManager = {
  setAccessToken: (token, rememberMe = false) => {
    const expiryDays = rememberMe ? 30 : 1;
    Cookies.set(ADMIN_TOKEN_NAME, token, {
      expires: expiryDays,
      ...cookieOptions,
    });
  },

  getAccessToken: () => {
    return Cookies.get(ADMIN_TOKEN_NAME) || null;
  },

  setRefreshToken: (token, rememberMe = false) => {
    const expiryDays = rememberMe ? 30 : 7;
    Cookies.set(ADMIN_REFRESH_TOKEN_NAME, token, {
      expires: expiryDays,
      ...cookieOptions,
    });
  },

  getRefreshToken: () => {
    return Cookies.get(ADMIN_REFRESH_TOKEN_NAME);
  },

  removeAccessToken: () => {
    Cookies.remove(ADMIN_TOKEN_NAME, { path: "/" });
  },

  removeRefreshToken: () => {
    Cookies.remove(ADMIN_REFRESH_TOKEN_NAME, { path: "/" });
  },

  removeAll: () => {
    Cookies.remove(ADMIN_TOKEN_NAME, { path: "/" });
    Cookies.remove(ADMIN_REFRESH_TOKEN_NAME, { path: "/" });
    // Remove any localStorage items that might have been set previously
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminRememberMe");
  },

  clearAll: () => {
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach((cookieName) => {
      Cookies.remove(cookieName, { path: "/" });
    });
  },
};