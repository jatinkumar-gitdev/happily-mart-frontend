/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#87ceeb",
          dark: "#6bb6d6",
          light: "#b0e0e6",
        },
        secondary: {
          DEFAULT: "#4682b4",
          light: "#5a9bd4",
        },
        accent: "#00bfff",
      },
    },
  },
  plugins: [],
};
