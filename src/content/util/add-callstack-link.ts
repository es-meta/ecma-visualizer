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
      const stack = existingData ? JSON.parse(existingData) : [];

      if (checkCycle(callId, stack)) {
        stack.unshift(callId);
        sessionStorage.setItem(key, JSON.stringify(stack));

        if (window.location.href.split("#")[0] === $a.href.split("#")[0]) {
          window.dispatchEvent(new CustomEvent("callstack updated"));
        }
        window.location.href = $a.href;
      }
    });
  });
}

function checkCycle(id: number, callStack: number[]): boolean {
  const tmpStack = [id, ...callStack];
  const lastIdx = tmpStack.length;

  for (let i = 1; i <= tmpStack.length / 2; i++) {
    const idx = lastIdx - i;
    const idx2 = lastIdx - i * 2;
    const arr1 = tmpStack.slice(idx);
    const arr2 = tmpStack.slice(idx2, idx);
    if (isArrayEqual(arr1, arr2)) return false;
  }

  return true;
}

function isArrayEqual(arr1: number[], arr2: number[]): boolean {
  return (
    arr1.length === arr2.length &&
    arr1.every((value, index) => value === arr2[index])
  );
}

export default addCallstackLink;
