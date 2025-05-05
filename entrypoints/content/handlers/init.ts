import { toStepString } from "@/entrypoints/content/handlers/convert-id.utils";

import { handleClick } from "./click";
import {
  MULTIPLEPROD,
  SDOInfo,
  VISCALL,
  VISDEFAULTSDO,
  VISELSE,
  VISID,
  VISIF,
  VISPRODUCTION,
  VISQM,
  VISSDOSTEP,
  VISSTEP,
  VISTHEN,
} from "../constants";

/* [ToDo] Hande Default SDO */
const IGNORE_SEC_IDS = new Set([
  "sec-ifabruptcloseiterator",
  "sec-ifabruptrejectpromise",
  "sec-static-semantics-allprivateidentifiersvalid",
  "sec-static-semantics-contains",
  "sec-static-semantics-containsarguments",
]);

function ignoreManually(secId: string, $emuAlg: HTMLElement) {
  if (IGNORE_SEC_IDS.has(secId)) return true;
}

export default function handleInit() {
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

      console.log(
        algType !== "sdo" &&
          $parent.querySelectorAll(":scope > emu-alg:not([example])").length >
            1,
        `<emu-clause id="${$parent.id}"/> has multiple <emu-alg>`,
      );

      switch (algType) {
        case "sdo":
          void (() => {
            const $emuGrammar = $emuAlg.previousElementSibling as HTMLElement;
            console.log(
              !$emuGrammar ||
                $emuGrammar.tagName.toLowerCase() !== "emu-grammar",
              `<emu-clause id="${$parent.id}"/> has a uncomplete pair of <emu-grammar> and <emu-alg>`,
            );

            transformGrammar($emuGrammar);

            const $emuProduction =
              $emuGrammar.querySelectorAll<HTMLElement>("emu-production");
            const $emuRhs =
              $emuProduction[0].querySelectorAll<HTMLElement>("emu-rhs");
            const isMultipleProd =
              $emuProduction.length > 1 || $emuRhs.length > 1;

            const defaultSDO = $emuRhs[0].getAttribute(VISID) as string;
            transformSDOAlgorithm($emuAlg, $parent.id, {
              defaultSDO,
              isMultipleProd,
            });
          })();
          break;
        default:
          transformAlgorithm($emuAlg, $parent.id);
      }

      transformCallLink($emuAlg);
    });

  document.addEventListener("click", handleClick);
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
    const defaultSDO = $li?.getAttribute(VISDEFAULTSDO);
    if (defaultSDO) $a.setAttribute(VISDEFAULTSDO, defaultSDO);
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

function transformSDOAlgorithm(
  $emuAlg: HTMLElement,
  visId: string,
  sdoInfo: SDOInfo,
) {
  $emuAlg.setAttribute(VISID, visId);
  transformStepRec($emuAlg, [], visId, sdoInfo);
}

function transformStepRec(
  $parent: HTMLElement,
  stepInNumArr: number[],
  idBase: string,
  sdoInfo: SDOInfo | null = null,
) {
  const $lis = $parent.querySelectorAll<HTMLLIElement>(":scope > ol > li");

  $lis.forEach(($li, idx) =>
    transformStepRec($li, stepInNumArr.concat(idx + 1), idBase, sdoInfo),
  );

  if (stepInNumArr.length !== 0 && $parent instanceof HTMLLIElement)
    transformStep($parent, `${idBase}|${toStepString(stepInNumArr)}`, sdoInfo);
}

function transformStep(
  $li: HTMLLIElement,
  visId: string,
  sdoInfo: SDOInfo | null = null,
) {
  $li.classList.add(sdoInfo ? VISSDOSTEP : VISSTEP);
  $li.setAttribute(VISID, visId);
  if (sdoInfo) {
    $li.setAttribute(VISDEFAULTSDO, sdoInfo.defaultSDO);
    if (sdoInfo.isMultipleProd) $li.setAttribute(MULTIPLEPROD, "");
  }

  let questionCnt = 1;
  $li.childNodes.forEach((node) => {
    if (transformQuestionMark(node, `${visId}|?${questionCnt}`, sdoInfo))
      questionCnt++;
  });

  const patterns: string[] = ["else", "otherwise"];
  patterns.forEach((pattern) =>
    transformInlineIfElse($li, visId, pattern, sdoInfo),
  );
  transformInlineIf($li, visId, sdoInfo);
}

function transformQuestionMark(
  node: ChildNode,
  visId: string,
  sdoInfo: SDOInfo | null,
) {
  if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue) return;
  const visClass = `${sdoInfo ? VISSDOSTEP : VISSTEP} ${VISQM}`;
  const defaultSDOAttr = sdoInfo
    ? ` ${VISDEFAULTSDO}="${sdoInfo.defaultSDO}"`
    : "";
  const multipleProdAttr = sdoInfo?.isMultipleProd ? ` ${MULTIPLEPROD}=""` : "";
  const modifiedText = node.nodeValue.replace(
    /\?/g,
    `<span class="${visClass}" visId="${visId}"${defaultSDOAttr}${multipleProdAttr}>?</span>`,
  );
  if (modifiedText === node.nodeValue) return;
  const fragment = document
    .createRange()
    .createContextualFragment(modifiedText);

  node.replaceWith(fragment);
  return true;
}

function transformInlineIfElse(
  $li: HTMLLIElement,
  visId: string,
  pattern: string,
  sdoInfo: SDOInfo | null,
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
    `<span class="${sdoInfo ? VISSDOSTEP : VISSTEP} ${VISIF}" visId="${visId}|if">${beforeIf}</span>` +
    ", " +
    `<span class="${sdoInfo ? VISSDOSTEP : VISSTEP} ${VISTHEN}" visId="${visId}|then">${ifToElse}</span>` +
    `<span class="${sdoInfo ? VISSDOSTEP : VISSTEP} ${VISELSE}" visId="${visId}|else">${elseToEnd}</span>`;

  $li.innerHTML = newHtml;
  if (sdoInfo) {
    $li.setAttribute(VISDEFAULTSDO, sdoInfo.defaultSDO);
    if (sdoInfo.isMultipleProd) $li.setAttribute(MULTIPLEPROD, "");
  }
  $li.classList.remove(VISSTEP);
}

function transformInlineIf(
  $li: HTMLLIElement,
  visId: string,
  sdoInfo: SDOInfo | null,
) {
  const textContent = getChildTextContent($li);
  if (/then$/.test(textContent)) return;
  if (!/if\b/i.test(textContent)) return;

  const html = $li.innerHTML;

  const commaIndex = html.match(",")?.index;
  if (commaIndex === undefined) return;

  const beforeIf = html.substring(0, commaIndex);
  const ifToElse = html.substring(commaIndex + 2);

  const newHtml =
    `<span class="${sdoInfo ? VISSDOSTEP : VISSTEP} ${VISIF}" visId="${visId}|if">${beforeIf}</span>` +
    ", " +
    `<span class="${sdoInfo ? VISSDOSTEP : VISSTEP} ${VISTHEN}" visId="${visId}|then">${ifToElse}</span>`;

  $li.innerHTML = newHtml;
  if (sdoInfo) {
    $li.setAttribute(VISDEFAULTSDO, sdoInfo.defaultSDO);
    if (sdoInfo.isMultipleProd) $li.setAttribute(MULTIPLEPROD, "");
  }
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
