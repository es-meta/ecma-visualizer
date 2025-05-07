import handleInit from "./handlers/init";
import "./globals.css";
import { showToast } from "./toast.utils";

/**
 * content script - 메인 페이지 DOM에 접근할 수 있습니다.
 */
const definition = defineContentScript({
  matches: ["https://tc39.es/*", "https://262.ecma-international.org/*"],
  main() {
    logger.log("content", import.meta.filename, "content script loaded");
    handleInit();
    logger.log("content", import.meta.filename, "transform done");
    showToast("✅ Ready to use ECMA Visualizer");
  },
});

export default definition;
