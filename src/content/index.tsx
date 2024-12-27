import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "../index.css";
import modifySpec from "./util/modify-spec.ts";
import { MessageType } from "../types/message.ts";

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
  const { installType, active } = await request("init");

  messageActive(active);
  if (installType !== "development") return;

  // For compare between extension steps and esmeta steps
  // const button = Object.assign(document.createElement("button"), {
  //   id: "extract-button",
  //   textContent: "Extract!",
  // });
  // document.body.append(button);
  //
  // button.addEventListener("click", () => {
  //   const ids = [...document.querySelectorAll(".step, .abrupt")].map(
  //     (el) => el.id,
  //   );
  //   const blob = new Blob([JSON.stringify(ids, null, 2)], {
  //     type: "application/json",
  //   });
  //   Object.assign(document.createElement("a"), {
  //     href: URL.createObjectURL(blob),
  //     download: "steps.json",
  //   }).click();
  // });
}

export async function request(msgTyp: MessageType, request: object = {}) {
  return await chrome.runtime.sendMessage({ msgTyp, ...request });
}
