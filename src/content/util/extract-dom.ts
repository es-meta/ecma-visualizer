export function extractSDO() {
  const $emuClause = document.getElementsByTagName("emu-clause");
  const $sdoEmuClauses = Array.from($emuClause).filter(
    (elem) => elem.getAttribute("type") === "sdo",
  );

  const json: Record<string, string> = {};
  $sdoEmuClauses.forEach(($sdoEmuClause) => {
    const $emuAlgs = Array.from($sdoEmuClause.getElementsByTagName("emu-alg"));
    $emuAlgs.forEach(($emuAlg) => {
      const emuAlgId = $emuAlg.getAttribute("visid");
      if (emuAlgId === null) return;

      const $emuGrammar = $emuAlg.previousElementSibling;
      if (
        $emuGrammar === null ||
        $emuGrammar.tagName.toLowerCase() !== "emu-grammar" ||
        $emuGrammar.getAttribute("type") === "definition"
      )
        return;

      const $emuProductions = Array.from(
        $emuGrammar.getElementsByTagName("emu-production"),
      );

      $emuProductions.forEach(($emuProduction) => {
        const $emuNts = $emuProduction.getElementsByTagName("emu-nt");
        const textNodes = Array.from($emuNts).map(
          ($emuNt) => $emuNt.textContent?.replace("opt", "") || "",
        );
        const str = textNodes.join(",");

        json[str] = $emuProduction.innerHTML.trim();
      });
    });
  });

  return json;
}

export function extractFuncName() {
  const $emuAlgs = document.getElementsByTagName("emu-alg");

  const json: Record<string, string> = {};
  Array.from($emuAlgs).forEach(($emuAlg) => {
    const ecId = $emuAlg.getAttribute("visid");
    if (ecId === null) return;

    const $emuClause = $emuAlg.parentElement;
    if (!$emuClause || $emuClause.tagName.toLowerCase() !== "emu-clause")
      return;

    const $h1 = $emuClause.querySelector("h1");
    if ($h1 === null) return;
    json[ecId] = $h1?.innerHTML;
  });

  return json;
}

export function extractInlineSteps() {
  const $inlineSteps = document.querySelectorAll(".inlinebranch");

  const json: Set<string> = new Set();
  Array.from($inlineSteps).forEach(($inlineStep) => {
    const $li = $inlineStep.parentElement;
    if ($li === null) return;
    const id = $li.getAttribute("visid");
    if (id !== null) json.add(id);
  });
  return [...json];
}
