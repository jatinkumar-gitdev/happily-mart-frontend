import Cookies from "js-cookie";

export const cookieManager = {
  set: (name, value, options = {}) => {
    Cookies.set(name, value, {
      expires: options.expires || 1,
      secure: import.meta.env.MODE === "production",
      sameSite: "strict",
      path: "/",
      ...options,
    });
  },

  get: (name) => {
    return Cookies.get(name);
  },

  remove: (name) => {
    Cookies.remove(name, { path: "/" });
  },

  clear: () => {
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach((cookieName) => {
      Cookies.remove(cookieName, { path: "/" });
    });
  },
};
