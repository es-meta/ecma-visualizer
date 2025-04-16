import path from "path";
import { defineConfig } from 'wxt';
import react from "@vitejs/plugin-react";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: "ECMA Visualizer",
    description: "providing example programs for ECMAScript Language Specification",
    version: "1.0",
    manifest_version: 3,
    action: {
      "default_icon": {
        "16": "images/dimmed-icon-16.png"
      }
    },
    // background: {
    //   "service_worker": "background/index.ts"
    // },
    permissions: ["storage", "tabs", "activeTab", "sidePanel"],
    // content_scripts: [
    //   {
    //     js: ["content/index.tsx"],
    //     css: ["index.css"],
    //     matches: [
    //       "https://tc39.es/ecma262/2024/*",
    //       "https://262.ecma-international.org/15.0/*"
    //     ]
    //   }
    // ],
    web_accessible_resources: [
      {
        resources: ["images/logo.jpeg", "resources/*"],
        matches: ["https://tc39.es/*", "https://262.ecma-international.org/*"]
      }
    ]
  },
  // https://vite.dev/config/
  vite: () => ({
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "entrypoints"),
      }
    },
    build: {
      cssCodeSplit: true,
      // rollupOptions: {
      //   input: {
      //     content: "./src/content/index.tsx",
      //     background: "./src/background/index.ts",
      //   },
      //   output: {
      //     entryFileNames: "[name].js",
      //     assetFileNames: "content.css",
      //   },
      // },
    },
  })
});



