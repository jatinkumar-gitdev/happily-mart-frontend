import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  
  const apiUrl = env.VITE_API_URL;
  const baseUrl = apiUrl.replace("/api", "");

  return {
    plugins: [react()],
    build: {
      outDir: "dist"
    },
    server: {
      port: 3001,
      proxy: {
        "/api": {
          target: baseUrl,
          changeOrigin: true,
        },
        "/uploads": {
          target: baseUrl,
          changeOrigin: true,
        },
        "/avatars": {
          target: baseUrl,
          changeOrigin: true,
        },
      },
    },
  };
});