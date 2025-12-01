import { create } from "zustand";

const useThemeStore = create((set, get) => {
  // Get initial theme from localStorage (already set by script in index.html)
  const getInitialTheme = () => {
    if (typeof window === "undefined") return "light";
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark" || savedTheme === "light"
      ? savedTheme
      : "light";
  };

  const initialTheme = getInitialTheme();

  // Ensure theme is applied on store creation
  if (typeof window !== "undefined") {
    const root = document.documentElement;
    if (initialTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }

  return {
    theme: initialTheme,
    toggleTheme: () => {
      const currentTheme = get().theme;
      const newTheme = currentTheme === "light" ? "dark" : "light";

      // Save to localStorage
      localStorage.setItem("theme", newTheme);

      // Update DOM immediately - ensure it's applied to html element
      const root = document.documentElement;
      if (newTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      // Update state
      set({ theme: newTheme });
    },
    setTheme: (theme) => {
      if (theme !== "light" && theme !== "dark") return;

      // Save to localStorage
      localStorage.setItem("theme", theme);

      // Update DOM immediately
      const root = document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      // Update state
      set({ theme });
    },
  };
});

export { useThemeStore };
