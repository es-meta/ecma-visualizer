import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  vite: () => ({
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
  }),
  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
  manifest: {
    name: "ECMA Visualizer",
    description:
      "Provides Example Programs for ECMA-262, the ECMAScript Language Specification.",
    autoIcons: {
      baseIconPath: "assets/icon.png",
    },
    permissions: ["sidePanel"],
    host_permissions: [
      "https://tc39.es/*",
      "https://262.ecma-international.org/*",
    ],
    web_accessible_resources: [
      {
        resources: ["images/logo.jpeg", "resources/*"],
        matches: ["https://tc39.es/*", "https://262.ecma-international.org/*"],
      },
    ],
  },
});
