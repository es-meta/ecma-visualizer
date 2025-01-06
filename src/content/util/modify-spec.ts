import { numToStep } from "./convert-id.ts";
import { MessageType } from "../../types/message.ts";

let $selectedEl: HTMLElement | null = null;

function modifySpec() {
  document.querySelectorAll("emu-clause").forEach(($emuClause) => {
    if (IGNORE_ALGO_PARENT_IDS.includes($emuClause.id)) return;

    const $emuAlgSiblings = Array.from($emuClause.children).filter(
      (child) => child.tagName.toLowerCase() === "emu-alg",
    );

    $emuAlgSiblings.forEach(($emuAlg, idx) => {
      const id = $emuClause.id.toLowerCase() + `[${idx}]`;
      $emuAlg.setAttribute("visId", id);
      const $lis = $emuAlg.querySelectorAll(
        ":scope > ol > li",
      ) as NodeListOf<HTMLLIElement>;
      highlightStepsRecursively($lis, id, 0);
    });
  });
}

function highlightStepsRecursively(
  $lis: NodeListOf<HTMLLIElement>,
  idAcc: string,
  depth: number,
) {
  $lis.forEach(($li, stepIdx) => {
    const nestedList = $li.querySelectorAll(
      ":scope > ol > li",
    ) as NodeListOf<HTMLLIElement>;
    const id =
      idAcc + (depth === 0 ? "/" : ".") + numToStep(stepIdx + 1, depth);

    highlightStep($li, id);
    if (nestedList.length != 0)
      highlightStepsRecursively(nestedList, id, depth + 1);
  });
}

function highlightStep($li: HTMLLIElement, id: string) {
  $li.classList.add("step");
  $li.setAttribute("visId", id);
  let abruptCnt = 1;
  $li.childNodes.forEach((node) => {
    if (wrapQuestionMarks(node, `${id}?${abruptCnt}`)) abruptCnt++;
  });

  $li.addEventListener("click", async (e: MouseEvent) => {
    if (!e.altKey) return;
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    if ($selectedEl) $selectedEl.classList.remove("selected");

    if (target.matches(".abrupt")) {
      target.classList.add("selected");
      $selectedEl = target;
    } else {
      $li.classList.add("selected");
      $selectedEl = $li;
    }

    await modifyEcmaVisualizer();
  });
}

function wrapQuestionMarks(node: ChildNode, id: string) {
  if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue) return;

  const modifiedText = node.nodeValue.replace(
    /\?/g,
    `<span class="abrupt" visId="${id}">?</span>`,
  );

  if (modifiedText !== node.nodeValue) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = modifiedText;
    while (tempDiv.firstChild)
      node.parentNode!.insertBefore(tempDiv.firstChild, node);
    node.remove();
    return true;
  }
}

async function modifyEcmaVisualizer() {
  if (!$selectedEl) return;

  const chunks = $selectedEl.getAttribute("visId")!.split("/");
  const [alg, step] = [chunks[0], chunks[1]];
  // console.log("Request", chunks[0], chunks[1]);
  // const { programs, name } = await request("prog", {
  //   alg: chunks[0],
  //   step: chunks[1],
  // });
  // console.log("Response", programs, name);

  window.dispatchEvent(new CustomEvent("custom", { detail: { alg, step } }));
}

export async function request(msgTyp: MessageType, request: object = {}) {
  return await chrome.runtime.sendMessage({ msgTyp, ...request });
}

const IGNORE_ALGO_PARENT_IDS = [
  "sec-weakref-execution",
  "sec-valid-chosen-reads",
  "sec-coherent-reads",
  "sec-tear-free-aligned-reads",
  "sec-races",
  "sec-data-races",
];

export default modifySpec;
