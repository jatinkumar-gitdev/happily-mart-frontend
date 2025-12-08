// Modern React-Select styles with transparency
export const modernSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "transparent",
    backdropFilter: "blur(10px)",
    borderColor: state.isFocused
      ? "rgb(14 165 233)"
      : "rgba(209, 213, 219, 0.5)",
    borderWidth: "1px",
    borderRadius: "0.75rem",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(14, 165, 233, 0.1)" : "none",
    minHeight: "44px",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: "rgb(14 165 233)",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "0.75rem",
    border: "1px solid rgba(209, 213, 219, 0.3)",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    overflow: "hidden",
    zIndex: 9999,
  }),
  menuList: (base) => ({
    ...base,
    padding: "0.5rem",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "rgb(14 165 233)"
      : state.isFocused
      ? "rgba(14, 165, 233, 0.1)"
      : "transparent",
    color: state.isSelected ? "#ffffff" : "inherit",
    borderRadius: "0.5rem",
    padding: "0.75rem 1rem",
    margin: "0.125rem 0",
    cursor: "pointer",
    transition: "all 0.15s ease",
    "&:active": {
      backgroundColor: "rgb(14 165 233)",
      color: "#ffffff",
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: "inherit",
  }),
  input: (base) => ({
    ...base,
    color: "inherit",
  }),
  placeholder: (base) => ({
    ...base,
    color: "rgba(156, 163, 175, 0.8)",
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? "rgb(14 165 233)" : "rgba(156, 163, 175, 0.8)",
    transition: "all 0.2s ease",
    "&:hover": {
      color: "rgb(14 165 233)",
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "rgba(156, 163, 175, 0.8)",
    "&:hover": {
      color: "rgb(239 68 68)",
    },
  }),
};

// Dark mode styles
export const darkSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    backdropFilter: "blur(10px)",
    borderColor: state.isFocused ? "rgb(56 189 248)" : "rgba(75, 85, 99, 0.5)",
    borderWidth: "1px",
    borderRadius: "0.75rem",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(56, 189, 248, 0.1)" : "none",
    minHeight: "44px",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: "rgb(56 189 248)",
      backgroundColor: "rgba(31, 41, 55, 0.7)",
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "rgba(31, 41, 55, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "0.75rem",
    border: "1px solid rgba(75, 85, 99, 0.3)",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
    overflow: "hidden",
    zIndex: 9999,
  }),
  menuList: (base) => ({
    ...base,
    padding: "0.5rem",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "rgb(56 189 248)"
      : state.isFocused
      ? "rgba(56, 189, 248, 0.1)"
      : "transparent",
    color: state.isSelected ? "#ffffff" : "#e5e7eb",
    borderRadius: "0.5rem",
    padding: "0.75rem 1rem",
    margin: "0.125rem 0",
    cursor: "pointer",
    transition: "all 0.15s ease",
    "&:active": {
      backgroundColor: "rgb(56 189 248)",
      color: "#ffffff",
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: "#e5e7eb",
  }),
  input: (base) => ({
    ...base,
    color: "#e5e7eb",
  }),
  placeholder: (base) => ({
    ...base,
    color: "rgba(156, 163, 175, 0.6)",
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? "rgb(56 189 248)" : "rgba(156, 163, 175, 0.6)",
    transition: "all 0.2s ease",
    "&:hover": {
      color: "rgb(56 189 248)",
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "rgba(156, 163, 175, 0.6)",
    "&:hover": {
      color: "rgb(248 113 113)",
    },
  }),
};
