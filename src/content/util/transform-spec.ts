import { visualizerDebug } from "@/lib/utils";
import { toStepString } from "./convert-id";
import { getCallStackFromStorage } from "@/types/call-stack";
import {
  customEventSDOSelection,
  customEventSelection,
  Selection,
} from "@/types/custom-event";

/*
    Follow algorithm extract logic of ESMeta
*/

/* [TODO] : handle multiple question marks in one step */
/* [TODO] : handle DEFAULT SDO (e.g sec-static-semantics-contains / sec-static-semantics-allprivateidentifiersvalid / sec-static-semantics-containsarguments) */
/* [TODO] : handle callClickEvent for SDO */
/* [TODO] : handle wrong comma indexes (e.g. WhileLoopEvaluation step e) */

const VISID = "visId";

const VISSTEP = "visStep";
const VISSDOSTEP = "visSDOStep";
const VISPRODUCTION = "visProduction";
const VISQM = "visQM";
const VISIF = "visIf";
const VISTHEN = "visThen";
const VISELSE = "visElse";
const VISCALL = "visCall";

function ignoreManually(secId: string, $emuAlg: HTMLElement) {
  if (
    secId !== "sec-ifabruptcloseiterator" &&
    secId !== "sec-ifabruptrejectpromise"
  )
    return false;

  if (
    $emuAlg.nextElementSibling?.nextElementSibling?.tagName.toLowerCase() ===
    "emu-alg"
  )
    return true;
}

function transformSpec() {
  document
    .querySelectorAll<HTMLElement>("emu-alg:not([example])")
    .forEach(($emuAlg) => {
      let $parent = $emuAlg.parentElement;

      if (
        $parent &&
        ($parent.id.endsWith("statment-rules") ||
          $parent.id.endsWith("expression-rules"))
      )
        $parent = $parent.parentElement;
      if (!$parent || IGNORE_ALGO_PARENT_IDS.has($parent.id)) return;
      if ($parent.tagName.toLowerCase() !== "emu-clause") return;
      if (ignoreManually($parent.id, $emuAlg)) return;

      const algType = $parent.getAttribute("type") ?? "";

      visualizerDebug(
        algType !== "sdo" &&
          $parent.querySelectorAll(":scope > emu-alg:not([example])").length >
            1,
        `<emu-clause id="${$parent.id}"/> has multiple <emu-alg>`,
      );

      switch (algType) {
        case "sdo":
          transformSDOAlgorithm($emuAlg, $parent.id);
          const $emuGrammar = $emuAlg.previousElementSibling as HTMLElement;
          visualizerDebug(
            !$emuGrammar || $emuGrammar.tagName.toLowerCase() !== "emu-grammar",
            `<emu-clause id="${$parent.id}"/> has a uncomplete pair of <emu-grammar> and <emu-alg>`,
          );

          transformGrammar($emuGrammar);
          break;
        default:
          transformAlgorithm($emuAlg, $parent.id);
      }

      transformCallLink($emuAlg);
    });

  document.addEventListener("click", (e: MouseEvent) => {
    if (!(e.target instanceof HTMLElement)) return;

    if (e.altKey) {
      const $clicked = e.target.closest(
        `.${VISSTEP}, .${VISSDOSTEP}, .${VISPRODUCTION}`,
      );
      if (!$clicked) return;

      stepClickEvent($clicked);
      e.preventDefault();
    } else {
      if (e.target.classList.contains(VISCALL)) callClickEvent(e.target);
    }
  });
}

let selectionSaver: Selection | null = null;
function stepClickEvent($clickedStep: Element) {
  const visId = $clickedStep.getAttribute(VISID) ?? "";
  if (!visId) console.error("A step must have a visId");

  if ($clickedStep.classList.contains(VISSTEP)) {
    selectionSaver = null;
    const [secId, step] = visId.split("|");
    customEventSelection({ secId, step });
  } else if ($clickedStep.classList.contains(VISSDOSTEP)) {
    const [secId, step] = visId.split("|");
    selectionSaver = {
      secId,
      step,
    };
    customEventSDOSelection();
  } else if ($clickedStep.classList.contains(VISPRODUCTION)) {
    if (!selectionSaver) return;

    console.log(`${selectionSaver.secId}|${visId}`);
    customEventSelection({
      secId: `${selectionSaver.secId}|${visId}`,
      step: selectionSaver.step,
    });
    selectionSaver = null;
  }
}

function callClickEvent($clickedA: Element): boolean {
  const visId = $clickedA.getAttribute(VISID) ?? "";
  if (!visId) console.error("A step must have a visId");

  const [callerAndStep, calleeId] = visId.split("->");
  const [callerId, step] = callerAndStep.split("|");

  const callstack = getCallStackFromStorage();
  callstack.push({ callerId, step, calleeId });

  return true;
}

function transformCallLink($emuAlg: HTMLElement) {
  $emuAlg.querySelectorAll("a").forEach(($a) => {
    const href = $a.getAttribute("href");
    if (!href || !href.includes("#sec-")) return;

    const $li = $a.closest("li");
    const callerIdAndStep = $li?.getAttribute(VISID);
    if (!callerIdAndStep) return;

    const [_, calleeId] = href.split("#");

    $a.classList.add(VISCALL);
    $a.setAttribute(VISID, `${callerIdAndStep}->${calleeId}`);
  });
}

function transformGrammar($emuGrammar: HTMLElement) {
  $emuGrammar
    .querySelectorAll<HTMLElement>("emu-production")
    .forEach(($emuProduction) => {
      transformProduction($emuProduction);
    });
}

function transformProduction($emuProduction: HTMLElement) {
  $emuProduction.querySelectorAll<HTMLElement>("emu-rhs").forEach(($emuRhs) => {
    transformRHS($emuRhs, $emuProduction.getAttribute("name") ?? "");
  });
}

function transformRHS($emuRhs: HTMLElement, productionName: string) {
  const visProduction =
    `${productionName}|` +
    [...$emuRhs.children]
      .filter(
        (child) =>
          child.tagName.toLowerCase() === "emu-nt" ||
          child.tagName.toLowerCase() === "emu-t",
      )
      .map((child) => child.textContent?.trim() ?? "")
      .filter((text) => text.length > 0)
      .join("|");

  $emuRhs.classList.add(VISPRODUCTION);
  $emuRhs.setAttribute(VISID, visProduction);
}

function transformAlgorithm($emuAlg: HTMLElement, visId: string) {
  $emuAlg.setAttribute(VISID, visId);
  transformStepRec($emuAlg, [], visId);
}

function transformSDOAlgorithm($emuAlg: HTMLElement, visId: string) {
  $emuAlg.setAttribute(VISID, visId);
  transformStepRec($emuAlg, [], visId, true);
}

function transformStepRec(
  $parent: HTMLElement,
  stepInNumArr: number[],
  idBase: string,
  sdo: boolean = false,
) {
  const $lis = $parent.querySelectorAll<HTMLLIElement>(":scope > ol > li");

  $lis.forEach(($li, idx) =>
    transformStepRec($li, stepInNumArr.concat(idx + 1), idBase, sdo),
  );

  if (stepInNumArr.length !== 0 && $parent instanceof HTMLLIElement)
    transformStep($parent, `${idBase}|${toStepString(stepInNumArr)}`, sdo);
}

function transformStep($li: HTMLLIElement, visId: string, sdo: boolean) {
  $li.classList.add(sdo ? VISSDOSTEP : VISSTEP);
  $li.setAttribute(VISID, visId);

  $li.childNodes.forEach((node) =>
    transformQuestionMark(node, `${visId}|?`, sdo),
  );

  const patterns: string[] = ["else", "otherwise"];
  patterns.forEach((pattern) =>
    transformInlineIfElse($li, visId, pattern, sdo),
  );
  transformInlineIf($li, visId, sdo);
}

function transformQuestionMark(node: ChildNode, visId: string, sdo: boolean) {
  if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue) return;

  const modifiedText = node.nodeValue.replace(
    /\?/g,
    `<span class="${sdo ? VISSDOSTEP : VISSTEP} ${VISQM}" visId="${visId}">?</span>`,
  );

  if (modifiedText === node.nodeValue) return;
  const fragment = document
    .createRange()
    .createContextualFragment(modifiedText);
  node.replaceWith(fragment);
}

function transformInlineIfElse(
  $li: HTMLLIElement,
  visId: string,
  pattern: string,
  sdo: boolean,
) {
  const textContent = getChildTextContent($li);
  const regex = new RegExp(`.*if.*${pattern}.*`, "i");
  if (!regex.test(textContent)) return;

  const html = $li.innerHTML;
  const regex2 = new RegExp(`\\b${pattern}\\b`, "i");

  const commaIndex = html.match(",")?.index;
  const elseIndex = html.match(regex2)?.index;
  if (commaIndex === undefined || elseIndex === undefined) return;

  const beforeIf = html.substring(0, commaIndex);
  const ifToElse = html.substring(commaIndex + 2, elseIndex);
  const elseToEnd = html.substring(elseIndex);

  const newHtml =
    `<span class="${sdo ? VISSDOSTEP : VISSTEP} ${VISIF}" visId="${visId}|if">${beforeIf}</span>` +
    ", " +
    `<span class="${sdo ? VISSDOSTEP : VISSTEP} ${VISTHEN}" visId="${visId}|then">${ifToElse}</span>` +
    `<span class="${sdo ? VISSDOSTEP : VISSTEP} ${VISELSE}" visId="${visId}|else">${elseToEnd}</span>`;

  $li.innerHTML = newHtml;
  $li.classList.remove(VISSTEP);
}

function transformInlineIf($li: HTMLLIElement, visId: string, sdo: boolean) {
  const textContent = getChildTextContent($li);
  if (/then$/.test(textContent)) return;
  if (!/if\b/i.test(textContent)) return;

  const html = $li.innerHTML;

  const commaIndex = html.match(",")?.index;
  if (commaIndex === undefined) return;

  const beforeIf = html.substring(0, commaIndex);
  const ifToElse = html.substring(commaIndex + 2);

  const newHtml =
    `<span class="${sdo ? VISSDOSTEP : VISSTEP} ${VISIF}" visId="${visId}|if">${beforeIf}</span>` +
    ", " +
    `<span class="${sdo ? VISSDOSTEP : VISSTEP} ${VISTHEN}" visId="${visId}|then">${ifToElse}</span>`;

  $li.innerHTML = newHtml;
  $li.classList.remove(VISSTEP);
}

function getChildTextContent($element: HTMLElement) {
  return Array.from($element.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.nodeValue?.trim())
    .join(" ");
}

const IGNORE_ALGO_PARENT_IDS = new Set([
  "sec-weakref-execution",
  "sec-valid-chosen-reads",
  "sec-coherent-reads",
  "sec-tear-free-aligned-reads",
  "sec-races",
  "sec-data-races",
]);

export default transformSpec;
