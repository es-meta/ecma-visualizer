import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
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
    background: {
      "service_worker": "background.js"
    },
    permissions: ["storage", "tabs", "activeTab"],
    content_scripts: [
      {
        js: ["content.js"],
        css: ["content.css"],
        matches: [
          "https://tc39.es/ecma262/2024/*",
          "https://262.ecma-international.org/15.0/*"
        ]
      }
    ],
    web_accessible_resources: [
      {
        resources: ["images/logo.jpeg", "resources/*"],
        matches: ["https://tc39.es/*", "https://262.ecma-international.org/*"]
      }
    ]
  }
  
});
