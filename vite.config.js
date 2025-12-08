import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      "/api": {
        target: "http://localhost:8800",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:8800",
        changeOrigin: true,
      },
      "/avatars": {
        target: "http://localhost:8800",
        changeOrigin: true,
      },
    },
  },
});
