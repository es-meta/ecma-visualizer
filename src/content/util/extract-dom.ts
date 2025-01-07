export function extractSDO() {
  const $emuClause = document.getElementsByTagName("emu-clause");
  const $sdoEmuClauses = Array.from($emuClause).filter(
    (elem) => elem.getAttribute("type") === "sdo",
  );

  const json = {};
  $sdoEmuClauses.forEach(($sdoEmuClause) => {
    const $emuAlgs = Array.from($sdoEmuClause.getElementsByTagName("emu-alg"));
    $emuAlgs.forEach(($emuAlg) => {
      const emuAlgId = $emuAlg.getAttribute("visid");
      if (emuAlgId === null) return;

      const $emuGrammar = $emuAlg.previousElementSibling;
      if (
        $emuGrammar === null ||
        $emuGrammar.tagName.toLowerCase() !== "emu-grammar"
      )
        return;

      const $emuProductions = Array.from(
        $emuGrammar.getElementsByTagName("emu-production"),
      );

      // @ts-expect-error : todo
      json[emuAlgId] = $emuProductions.map(($emuProduction) =>
        $emuProduction.innerHTML.trim(),
      );
    });
  });

  return json;
}
