export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    SIGNUP: "/auth/signup",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    SEND_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    REFRESH_TOKEN: "/auth/refresh-token",
    ME: "/auth/me",
  },
  // User
  USER: {
    PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/profile",
    UPLOAD_AVATAR: "/user/avatar",
    SET_PRESET_AVATAR: "/user/avatar/preset",
    CHANGE_PASSWORD: "/user/change-password",
    REQUEST_ACCOUNT_DELETION: "/user/account/delete-request",
    CANCEL_ACCOUNT_DELETION: "/user/account/cancel-deletion",
    DEACTIVATE_ACCOUNT: "/user/account/deactivate",
    GET_ACCOUNT_STATUS: "/user/account/status",
    FORGOT_PASSWORD_DELETION: "/user/account/forgot-password-deletion",
    REQUEST_REACTIVATION: "/user/account/request-reactivation",
    VERIFY_REACTIVATION: "/user/account/verify-reactivation",
    VERIFY_EMAIL_CHANGE: "/user/email/change/verify",
  },
  // Posts
  POSTS: {
    CREATE: "/posts",
    GET_ALL: "/posts",
    GET_FAVORITES: "/posts/favorites",
    GET_PUBLIC: "/posts/public",
    SEARCH: "/posts/search",
    GET_BY_ID: (id) => `/posts/${id}`,
    LIKE: (id) => `/posts/${id}/like`,
    FAVORITE: (id) => `/posts/${id}/favorite`,
    SHARE: (id) => `/posts/${id}/share`,
    ADD_COMMENT: (id) => `/posts/${id}/comment`,
    GET_COMMENTS: (id) => `/posts/${id}/comments`,
    UNLOCK: (id) => `/posts/${id}/unlock`,
  },
  // Payments
  PAYMENTS: {
    CREATE_ORDER: "/payments/create-order",
    VERIFY: "/payments/verify",
    HISTORY: "/payments/history",
  },
  // Subscriptions
  SUBSCRIPTIONS: {
    GET_PLANS: "/subscriptions/plans",
    MY_SUBSCRIPTION: "/subscriptions/my-subscription",
    CREATE_ORDER: "/subscriptions/create-order",
    VERIFY: "/subscriptions/verify-payment",
    HISTORY: "/subscriptions/history",
    USE_CREDIT: "/subscriptions/use-credit",
  },
};
