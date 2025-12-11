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
  // Admin Auth
  ADMIN_AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
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
    GET_DEALS_WORKSPACE: "/user/deals/workspace",
    GET_POSTS_STATS: "/user/posts/stats",
  },
  // Admin Users
  ADMIN_USERS: {
    GET_ALL: "/admin/users",
    GET_BY_ID: (id) => `/admin/users/${id}`,
    UPDATE: (id) => `/admin/users/${id}`,
    DEACTIVATE: (id) => `/admin/users/${id}/deactivate`,
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
    UPDATE_DEAL_TOGGLE: (id) => `/posts/${id}/deal-toggle`,
    UPDATE_VALIDITY: (id) => `/posts/${id}/validity`,
    GET_VALIDITY_OPTIONS: (id) => `/posts/${id}/validity/options`,
    INCREMENT_VIEW_COUNT: (id) => `/posts/${id}/view`,
    EDIT: (id) => `/posts/${id}`, // Add new endpoint for editing posts
  },
  // Admin Posts
  ADMIN_POSTS: {
    GET_ALL: "/admin/posts",
    GET_BY_ID: (id) => `/admin/posts/${id}`,
    UPDATE_STATUS: (id) => `/admin/posts/${id}/status`,
  },
  // Deals
  DEALS: {
    GET_USER_DEALS: "/deals",
    GET_STATS: "/deals/stats",
    GET_BY_ID: (id) => `/deals/${id}`,
    UPDATE_STATUS: (id) => `/deals/${id}/status`,
    GET_NOTIFICATIONS: "/deals/notifications",
    MARK_NOTIFICATION_READ: (notificationId) => `/deals/notifications/${notificationId}/read`,
  },
  // Admin Deals
  ADMIN_DEALS: {
    GET_ALL: "/admin/deals",
    GET_BY_ID: (id) => `/admin/deals/${id}`,
    UPDATE_STATUS: (id) => `/admin/deals/${id}/status`,
    CLOSE: (id) => `/admin/deals/${id}`,
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
  // Admin Analytics
  ADMIN_ANALYTICS: {
    DEALS: "/admin/analytics/deals",
    ACTIVITY: "/admin/analytics/activity",
  },
};