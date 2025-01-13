import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        content: "./src/content/index.tsx",
        background: "./src/background/index.ts",
      },
      output: {
        entryFileNames: "[name].js",
        assetFileNames: "content.css",
      },
    },
  },
});
