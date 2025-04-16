import transformSpec from "./util/transform-spec";
import { MessageType } from "@/types/message";
import { createRoot } from "react-dom/client";

export default defineContentScript({
  matches: ["https://tc39.es/*", "https://262.ecma-international.org/*"],
  main() {

    const $body = document.querySelector("body")!;
    const $root = document.createElement("section");
    $body.classList.add("active");
    initDom();

    window.addEventListener("popstate", (e) => {
      window.dispatchEvent(new CustomEvent("callstack updated"));
    });

    window.addEventListener("pageshow", (e) => {
      window.dispatchEvent(new CustomEvent("callstack updated"));
    });

    function initDom() {
      transformSpec();
      createEcmaVisualizer();
      initState().then((_) => _);
    }

    function createEcmaVisualizer() {
      $root.id = "root";
      document.body.appendChild($root);

      createRoot(document.getElementById("root")!).render(<div />);
    }

    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (msg.check.includes("active")) messageActive(msg.active);
      sendResponse({});
      return true;
    });

    function messageActive(active: boolean) {
      if (active) {
        $root?.classList.add("active");
        $body.classList.add("active");
      } else {
        $root?.classList.remove("active");
        $body.classList.remove("active");
      }
    }

    async function initState() {
      const { active } = await request("init");
      messageActive(active);
    }

    async function request(msgTyp: MessageType, request: object = {}) {
      return await chrome.runtime.sendMessage({ msgTyp, ...request });
    }

    console.log('content script loaded');
    initDom();
  }
})
