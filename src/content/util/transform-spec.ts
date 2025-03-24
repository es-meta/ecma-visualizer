import { visualizerDebug } from "@/lib/utils";
import { toStepString } from "./convert-id";

/*
    Follow algorithm extract logic of ESMeta
*/

const VISID = "visId";

const VISSTEP = "visStep";
const VISSDOSTEP = "visSDOStep";
const VISQM = "visQM";
const VISIF = "visIf";
const VISTHEN = "visThen";
const VISELSE = "visElse";

const $selectedStep = null;

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
          /* [TODO] : handle DEFAULT SDO (e.g sec-static-semantics-contains / sec-static-semantics-allprivateidentifiersvalid / sec-static-semantics-containsarguments) */
          visualizerDebug(
            !$emuGrammar || $emuGrammar.tagName.toLowerCase() !== "emu-grammar",
            `<emu-clause id="${$parent.id}"/> has a uncomplete pair of <emu-grammar> and <emu-alg>`,
          );
          transformGrammar($emuGrammar);
          break;
        default:
          transformAlgorithm($emuAlg, $parent.id);
      }
    });

  document.addEventListener("click", (e: MouseEvent) => {
    if (!e.altKey || !(e.target instanceof HTMLElement)) return;

    const $clickedStep = isClickable(e.target);
    if (!$clickedStep) return;
    e.preventDefault();

    const visId = $clickedStep.getAttribute(VISID) ?? "";
    if (!visId) console.error("A step must have a visId");

    if ($clickedStep.classList.contains(VISSTEP)) {
      const [secId, step] = visId.split("|");
      window.dispatchEvent(
        new CustomEvent("custom", { detail: { secId, step } }),
      );
    } else if ($clickedStep.classList.contains(VISSDOSTEP))
      window.dispatchEvent(
        new CustomEvent("custom", { detail: "SDO" + visId }),
      );
  });
}

function transformCallLink($emuAlg: HTMLElement) {
  // const $links = $emuAlg
  //   .querySelectorAll<HTMLAnchorElement>("a")
  //   .forEach(($a) => {
  //     const $li = $a.closest("li");
  //     if (!$li || !$li.getAttribute(VISID)) return;
  //   });
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
    transformRHS($emuRhs);
  });
}

function transformRHS($emuRhs: HTMLElement) {}

function isClickable($target: HTMLElement): HTMLElement | null {
  if ([VISSTEP, VISSDOSTEP].some((cn) => $target.classList.contains(cn)))
    return $target;
  const $parent = $target.parentElement;
  if ([VISSTEP, VISSDOSTEP].some((cn) => $parent?.classList.contains(cn)))
    return $parent;
  return null;
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

/* [TODO] : handle multiple question marks in one step */
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

  /* [TODO] : handle wrong comma indexes (e.g. WhileLoopEvaluation step e) */
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
