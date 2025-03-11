import { toStepString } from './convert-id'

/*
    Follow algorithm extract logic of ESMeta
*/

const VISID = "visId"
const VISSTEP = "visStep"
const VISQM = "visQM"
const VISIF = "visIf"
const VISTHEN = "visThen"
const VISELSE = "visElse"

function transformSpec() {
    document.querySelectorAll<HTMLElement>("emu-alg:not([example])").forEach(($emuAlg) => {
        let $parent = $emuAlg.parentElement
    
        if($parent && ($parent.id.endsWith("statment-rules") || $parent.id.endsWith("statment-rules"))) 
            $parent = $parent.parentElement
        if(!$parent || IGNORE_ALGO_PARENT_IDS.has($parent.id)) return
        if($parent.tagName.toLowerCase() !== "emu-clause") return

        const algType = $parent.getAttribute("type")
        if(!algType) return
        switch(algType) {
            case "sdo" : transformGrammar(); break;
            default : 
                $emuAlg.setAttribute(VISID, $parent.id)
                transformAlgorithm($emuAlg, $parent.id)
        }
    })
}

function transformAlgorithm($emuAlg : HTMLElement, visId: string) {
    transformStepRec($emuAlg, [], visId)
}

function transformStepRec($parent : HTMLElement, stepInNumArr : number[], idBase : string) {
    const $lis = $parent.querySelectorAll<HTMLLIElement>(":scope > ol > li")
    
    $lis.forEach(($li, idx) =>
        transformStepRec($li, stepInNumArr.concat(idx+1), idBase)
    )

    if(stepInNumArr.length !== 0 && $parent instanceof HTMLLIElement) 
        transformStep($parent, `${idBase}|${toStepString(stepInNumArr)}`)
}

function transformStep($li: HTMLLIElement, visId: string) {
    $li.classList.add(VISSTEP)
    $li.setAttribute(VISID, visId)

    $li.childNodes.forEach((node) => transformQuestionMark(node, `${visId}|?`))

    const patterns : string[] = ["else", "otherwise"]
    patterns.forEach((pattern) => transformInlineIfElse($li, visId, pattern))
    transformInlineIf($li, visId)
}

// TODO : handle multiple question marks in one step
function transformQuestionMark(node: ChildNode, visId : string){
    if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue) return;

    const modifiedText = node.nodeValue.replace(
        /\?/g,
        `<span class="${VISSTEP} ${VISQM}" visId="${visId}">?</span>`,
      );
    
    if (modifiedText !== node.nodeValue) {
        const fragment = document.createRange().createContextualFragment(modifiedText)
        node.replaceWith(fragment)
    }
}

function transformInlineIfElse($li: HTMLLIElement, visId: string, pattern: string){
    const textContent = getChildTextContent($li)
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
        `<span class="${VISSTEP} ${VISIF}" visId="${visId}|if">${beforeIf}</span>` +
        ", " +
        `<span class="${VISSTEP} ${VISTHEN}" visId="${visId}|then">${ifToElse}</span>` +
        `<span class="${VISSTEP} ${VISELSE}" visId="${visId}|else">${elseToEnd}</span>`;

    $li.innerHTML = newHtml;
    $li.classList.remove(VISSTEP);
}

function transformInlineIf($li: HTMLLIElement, visId: string) {
    const textContent = getChildTextContent($li)
    if (/then$/.test(textContent)) return;
    if (!/if\b/i.test(textContent)) return;
  
    const html = $li.innerHTML;
  
    // const ifIndex = html.match(/\bif\b/i)?.index;
    const commaIndex = html.match(",")?.index;
    if (commaIndex === undefined) return;
  
    const beforeIf = html.substring(0, commaIndex);
    const ifToElse = html.substring(commaIndex + 2);
  
    const newHtml =
      `<span class="${VISSTEP} ${VISIF}" visId="${visId}|if">${beforeIf}</span>` +
      ", " +
      `<span class="${VISSTEP} ${VISTHEN}" visId="${visId}|then">${ifToElse}</span>`;
  
    $li.innerHTML = newHtml;
    $li.classList.remove(VISSTEP);
  }

function transformGrammar() {
    // ToDo
}

function getChildTextContent($element : HTMLElement) {
    return Array.from($element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.nodeValue?.trim()).join(" ")
}

const IGNORE_ALGO_PARENT_IDS = new Set([
    "sec-weakref-execution",
    "sec-valid-chosen-reads",
    "sec-coherent-reads",
    "sec-tear-free-aligned-reads",
    "sec-races",
    "sec-data-races",
  ])

export default transformSpec