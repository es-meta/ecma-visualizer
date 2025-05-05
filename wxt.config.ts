import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "ECMA Visualizer",
    description:
      "providing example programs for ECMAScript Language Specification",
    version: "2.0",
    action: {
      default_icon: {
        "16": "images/icon-16.png",
      },
    },
    permissions: ["storage", "tabs", "activeTab", "sidePanel"],
    web_accessible_resources: [
      {
        resources: ["images/logo.jpeg", "resources/*"],
        matches: ["https://tc39.es/*", "https://262.ecma-international.org/*"],
      },
    ],
  },
});
