// import { numToStep } from "./convert-id.ts";
// import { MessageType } from "../../types/message.ts";

// let $selectedEl: HTMLElement | null = null;

// function modifySpec() {
//   document.querySelectorAll("emu-clause").forEach(($emuClause) => {
//     if (IGNORE_ALGO_PARENT_IDS.includes($emuClause.id)) return;

//     const $emuAlgSiblings = Array.from($emuClause.children).filter(
//       (child) => child.tagName.toLowerCase() === "emu-alg",
//     );

//     $emuAlgSiblings.forEach(($emuAlg, idx) => {
//       const id = $emuClause.id + `[${idx}]`;
//       $emuAlg.setAttribute("visId", id);
//       const $lis = $emuAlg.querySelectorAll(
//         ":scope > ol > li",
//       ) as NodeListOf<HTMLLIElement>;
//       highlightStepsRecursively($lis, id, 0);
//     });
//   });

//   document.querySelectorAll(".step").forEach((step) => {
//     const $step = step as HTMLElement;
//     $step.addEventListener("click", (e: MouseEvent) => {
//       if (!e.altKey) return;
//       e.preventDefault();
//       e.stopPropagation();

//       const target = e.currentTarget as HTMLElement;
//       if (!target.matches(".step")) return;

//       if ($selectedEl) $selectedEl.classList.remove("selected");

//       if (target.matches(".abrupt")) {
//         target.classList.add("selected");
//         $selectedEl = target;
//       } else if (target.matches(".inlinebranch")) {
//         target.classList.add("selected");
//         $selectedEl = target;
//       } else if (target.matches("li")) {
//         target.classList.add("selected");
//         $selectedEl = target;
//       }

//       modifyEcmaVisualizer();
//     });
//   });
// }

// function highlightStepsRecursively(
//   $lis: NodeListOf<HTMLLIElement>,
//   idAcc: string,
//   depth: number,
// ) {
//   $lis.forEach(($li, stepIdx) => {
//     const nestedList = $li.querySelectorAll(
//       ":scope > ol > li",
//     ) as NodeListOf<HTMLLIElement>;
//     const id =
//       idAcc + (depth === 0 ? "/" : ".") + numToStep(stepIdx + 1, depth);

//     highlightStep($li, id);
//     if (nestedList.length != 0)
//       highlightStepsRecursively(nestedList, id, depth + 1);
//   });
// }

// function highlightStep($li: HTMLLIElement, id: string) {
//   $li.classList.add("step");
//   $li.setAttribute("visId", id);
//   let abruptCnt = 1;

//   for (let i = $li.childNodes.length - 1; i >= 0; i--) {
//     const node = $li.childNodes[i];
//     if (wrapQuestionMarks(node, `${id}?${abruptCnt}`)) abruptCnt++;
//   }

//   ["else", "otherwise"].forEach((pattern) =>
//     wrapIfElseSections($li, id, pattern),
//   );
//   wrapInlineIf($li, id);
// }

// function wrapQuestionMarks(node: ChildNode, id: string) {
//   if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue) return;

//   const modifiedText = node.nodeValue.replace(
//     /\?/g,
//     `<span class="step abrupt" visId="${id}">?</span>`,
//   );

//   if (modifiedText !== node.nodeValue) {
//     const tempDiv = document.createElement("div");
//     tempDiv.innerHTML = modifiedText;
//     while (tempDiv.firstChild)
//       node.parentNode!.insertBefore(tempDiv.firstChild, node);
//     node.remove();
//     return true;
//   }
// }

// function modifyEcmaVisualizer() {
//   if (!$selectedEl) return;

//   const chunks = $selectedEl.getAttribute("visId")!.split("/");
//   const [ecId, step] = [chunks[0], chunks[1]];
//   window.dispatchEvent(new CustomEvent("custom", { detail: { ecId, step } }));
// }

// export async function request(msgTyp: MessageType, request: object = {}) {
//   return await chrome.runtime.sendMessage({ msgTyp, ...request });
// }

// const IGNORE_ALGO_PARENT_IDS = [
//   "sec-weakref-execution",
//   "sec-valid-chosen-reads",
//   "sec-coherent-reads",
//   "sec-tear-free-aligned-reads",
//   "sec-races",
//   "sec-data-races",
// ];

// function wrapInlineIf(liElement: HTMLLIElement, base: string) {
//   const pureLineText = getTextContentWithoutOL(liElement);
//   if (/then$/.test(pureLineText)) return;
//   if (!/if\b/i.test(pureLineText)) return;

//   const html = liElement.innerHTML;

//   // const ifIndex = html.match(/\bif\b/i)?.index;
//   const commaIndex = html.match(",")?.index;
//   if (commaIndex === undefined) return;

//   const beforeIf = html.substring(0, commaIndex);
//   const ifToElse = html.substring(commaIndex + 2);

//   const newHtml =
//     `<span class="step inlinebranch if" visId="${base}">${beforeIf}</span>` +
//     ", " +
//     `<span class="step inlinebranch then" visId="${base}then">${ifToElse}</span>`;

//   liElement.innerHTML = newHtml;
//   liElement.classList.remove("step");
// }

// function wrapIfElseSections(
//   liElement: HTMLLIElement,
//   base: string,
//   pattern: string,
// ) {
//   const replaced = getTextContentWithoutOL(liElement).replace(/\s+/g, "");
//   const regex = new RegExp(`.*if.*${pattern}.*`, "i");
//   if (!regex.test(replaced)) return;

//   const html = liElement.innerHTML;
//   const regex2 = new RegExp(`\\b${pattern}\\b`, "i");

//   // const ifIndex = html.match(/\bif\b/i)?.index;
//   const commaIndex = html.match(",")?.index;
//   const elseIndex = html.match(regex2)?.index;
//   if (commaIndex === undefined || elseIndex === undefined) return;

//   const beforeIf = html.substring(0, commaIndex);
//   const ifToElse = html.substring(commaIndex + 2, elseIndex);
//   const elseToEnd = html.substring(elseIndex);

//   const newHtml =
//     `<span class="step inlinebranch if" visId="${base}">${beforeIf}</span>` +
//     ", " +
//     `<span class="step inlinebranch then" visId="${base}then">${ifToElse}</span>` +
//     `<span class="step inlinebranch else" visId="${base}else">${elseToEnd}</span>`;

//   liElement.innerHTML = newHtml;
//   liElement.classList.remove("step");
// }

// function getTextContentWithoutOL(element: Element) {
//   const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
//     acceptNode: function (node) {
//       let parent = node.parentNode;
//       while (parent && parent !== element) {
//         if ((parent as HTMLElement).tagName === "OL") {
//           return NodeFilter.FILTER_REJECT;
//         }
//         parent = parent.parentNode;
//       }
//       return NodeFilter.FILTER_ACCEPT;
//     },
//   });

//   let result = "";
//   let currentNode;
//   while ((currentNode = walker.nextNode())) {
//     result += currentNode.textContent;
//   }

//   return result;
// }

// export default modifySpec;
