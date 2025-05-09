import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
  manifest: async () => ({
    name: "ECMA Visualizer",
    description:
      "Provides Example Programs for ECMA-262, the ECMAScript Language Specification.",
    version: import.meta.env.VITE_EXTENSION_VERSION,
    autoIcons: {
      baseIconPath: "assets/icon.png",
    },
    permissions: ["storage", "tabs", "sidePanel"],
    web_accessible_resources: [
      {
        resources: ["images/logo.jpeg", "resources/*"],
        matches: ["https://tc39.es/*", "https://262.ecma-international.org/*"],
      },
    ],
  }),
});
