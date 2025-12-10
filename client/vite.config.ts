import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    host: true,          // permite acesso externo
    port: 5173,          // porta fixa para Replit
    strictPort: true,    // não tenta outra porta
    open: false,
    hmr: {
      protocol: "ws",
      host: "0.0.0.0",
      port: 5173,
    },
  },

  preview: {
    host: true,
    port: 5173,
  },

  resolve: {
    alias: {
      "@": "/src",
    },
  },
});