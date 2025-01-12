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

    $a.setAttribute("call", callId.toString());
    $a.classList.add("callstep");
    $a.addEventListener("click", (e) => {
      e.preventDefault();

      const existingData = sessionStorage.getItem("callstack");
      const dataArray = existingData ? JSON.parse(existingData) : [];
      dataArray.push(callId);
      sessionStorage.setItem("callstack", JSON.stringify(dataArray));

      if (window.location.href.split("#")[0] === $a.href.split("#")[0]) {
        window.location.href = $a.href;
        window.location.reload();
      } else {
        window.location.href = $a.href;
      }
    });
  });
}

export default addCallstackLink;
