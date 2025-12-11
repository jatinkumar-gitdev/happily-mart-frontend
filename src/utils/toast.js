import toast from "react-hot-toast";

const baseOptions = {
  position: "top-right",
  duration: 4000,
  style: {
    background: "#0f172a",
    color: "#f8fafc",
    fontSize: "0.95rem",
    fontWeight: 500,
    borderRadius: "0.75rem",
    padding: "0.75rem 1rem",
  },
};

export const showSuccess = (message, options = {}) =>
  toast.success(message, {
    ...baseOptions,
    ...options,
  });

export const showError = (message, options = {}) =>
  toast.error(message, {
    ...baseOptions,
    style: {
      ...baseOptions.style,
      background: "#7f1d1d",
    },
    ...options,
  });

export const showInfo = (message, options = {}) =>
  toast(message, {
    ...baseOptions,
    style: {
      ...baseOptions.style,
      background: "#075985",
    },
    icon: "ℹ️",
    ...options,
  });

export const showLoading = (message, options = {}) =>
  toast.loading(message, {
    ...baseOptions,
    duration: 6000,
    ...options,
  });

  export const showWarning = (message, options = {}) =>
  toast.warning(message, {
    ...baseOptions,
    style: {
      ...baseOptions.style,
      background: "#d97706",
    },
    icon: "⚠️",
    ...options,
  });

export const dismissToast = (toastId) => toast.dismiss(toastId);


