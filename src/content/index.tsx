import "../index.css";
import modifySpec from "./util/modify-spec.ts";
import { MessageType } from "../types/message.ts";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { extractInlineSteps } from "./util/extract-dom.ts";

const $body = document.querySelector("body")!;
const $root = document.createElement("section");
$body.classList.add("active");
initDom();

function initDom() {
  createEcmaVisualizer();
  modifySpec();
  initState().then((_) => _);
}

function createEcmaVisualizer() {
  $root.id = "root";
  document.body.appendChild($root);

  createRoot(document.getElementById("root")!).render(<App />);
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

  // if (installType !== "development") return;

  // DOM Extraction for full support in multi page mode
  const button = Object.assign(document.createElement("button"), {
    id: "extract-button",
    textContent: "Extract!",
  });
  document.body.append(button);

  button.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(extractInlineSteps(), null, 2)], {
      type: "application/json",
    });

    Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: "inline-step.json",
    }).click();
  });
}

export async function request(msgTyp: MessageType, request: object = {}) {
  return await chrome.runtime.sendMessage({ msgTyp, ...request });
}
