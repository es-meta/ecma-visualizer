import transformSpec from "./util/transform-spec";

const ContentScriptDefinition = defineContentScript({
  matches: ["https://tc39.es/*", "https://262.ecma-international.org/*"],
  main() {
    window.addEventListener("popstate", (e) => {
      window.dispatchEvent(new CustomEvent("callstack updated"));
    });

    window.addEventListener("pageshow", (e) => {
      window.dispatchEvent(new CustomEvent("callstack updated"));
    });

    function initDom() {
      transformSpec();
      console.log('transform done');
      // TODO 
      // initState().then((_) => _);
    }

    console.log('content script loaded');
    initDom();
  }
})

export default ContentScriptDefinition;