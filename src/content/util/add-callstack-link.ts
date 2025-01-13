async function addCallstackLink() {
  const jsonUrl = chrome.runtime.getURL("resources/ecId-to-callId.json");
  const response = await fetch(jsonUrl);
  const data = await response.json();

  const $as = document.getElementsByTagName("a");
  Array.from($as).forEach(($a) => {
    const $href = $a.getAttribute("href");
    if ($href === null || !$href.includes("#sec-")) return;

    const $li = $a.closest("li");
    if ($li === null) return;

    const callerAndStep = $li.getAttribute("visid");
    if (callerAndStep === null) return;

    const callee = $href.split("#");
    if (callee.length <= 1) return;

    const callId: number = data[callerAndStep + "/" + callee[1] + "[0]"];
    if (callId === undefined) return;

    const key = "CALLSTACK";

    $a.setAttribute("call", callId.toString());
    $a.classList.add("callstep");
    $a.addEventListener("click", (e) => {
      e.preventDefault();

      const existingData = sessionStorage.getItem(key);
      const existingData2 = sessionStorage.getItem("ECID");
      const stack = existingData ? JSON.parse(existingData) : [];
      const ecId = existingData2 ? JSON.parse(existingData2) : [];
      const c = callerAndStep.split("/");
      const caller = c[0];

      const [newCallStack, newEcId] = checkStack(callId, stack, ecId, caller);

      newCallStack.unshift(callId);
      newEcId.unshift(callee[1] + "[0]");
      sessionStorage.setItem(key, JSON.stringify(newCallStack));
      sessionStorage.setItem("ECID", JSON.stringify(newEcId));

      if (window.location.href.split("#")[0] === $a.href.split("#")[0]) {
        window.dispatchEvent(new CustomEvent("callstack updated"));
      }
      window.location.href = $a.href;
    });
  });
}

function checkStack(
  callId: number,
  callStack: number[],
  ecId: string[],
  callEc: string,
): [number[], string[]] {
  if (callStack.length > 0) {
    const lastEcId = ecId[0];
    if (lastEcId !== callEc) return [[], []];
  }

  const idSet = new Set(callStack);
  if (idSet.has(callId)) {
    while (callStack.length > 0) {
      const head = callStack.shift()!;
      ecId.shift();
      if (head === callId) break;
    }
  }
  return [callStack, ecId];
}

function isArrayEqual(arr1: number[], arr2: number[]): boolean {
  return (
    arr1.length === arr2.length &&
    arr1.every((value, index) => value === arr2[index])
  );
}

export default addCallstackLink;
