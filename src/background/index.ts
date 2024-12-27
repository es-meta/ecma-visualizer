import Tab = chrome.tabs.Tab;
import TabChangeInfo = chrome.tabs.TabChangeInfo;
import {
  getExtensionState,
  getTabState,
  setExtensionState,
  setTabState,
} from "./extension-state.ts";

const ECMA_20204_URL: string = "https://tc39.es/ecma262/2024/";

/*
  Todo: Caching?
 */

async function loadJson(url: string) {
  const response = await fetch(chrome.runtime.getURL(url));
  return await response.json();
}

chrome.runtime.onInstalled.addListener(() => {
  (async () => {
    await setExtensionState({
      nodeToProgId: await loadJson("/node-to-progId.json"),
      stepToNode: await loadJson("/step-to-node.json"),
      progIdToProg: await loadJson("/progId-to-prog.json"),
      installType: (await chrome.management.getSelf()).installType,
    });

    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (!tab.id || !tab.url) return;
      await enableChromeButton(tab.id, tab.url);
    }
  })();
});

/*
  FixMe : should work only on
    - url change
    - refresh
    - new tab
 */
chrome.tabs.onUpdated.addListener(
  (tabId: number, changeInfo: TabChangeInfo, _tab: Tab) => {
    (async () => {
      if (changeInfo.url) await enableChromeButton(tabId, changeInfo.url);
      if (changeInfo.status === "loading") {
        await setTabState(tabId, { active: false });
        await enableChromeButton(
          tabId,
          (await chrome.tabs.get(tabId)).url || "",
        );
      }
    })();
  },
);

async function enableChromeButton(tabId: number, url: string) {
  if (url.includes(ECMA_20204_URL)) {
    await chrome.action.enable(tabId);
    await setTabState(tabId, { active: true });
  } else {
    await chrome.action.disable(tabId);
    await setTabState(tabId, { active: false });
  }
}

/* Extension Icon Event Listener */
chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;
  toggleActivity(tab.id).catch((e) => console.error(e));
});

/* Response to content script */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    const { msgTyp, alg, step } = msg;
    const { installType, stepToNode, nodeToProgId, progIdToProg, ...tabs } =
      await getExtensionState();

    if (msgTyp === "init")
      sendResponse({
        installType: installType,
        active: sender.tab?.id ? tabs[sender.tab.id].active : false,
      });

    if (msgTyp === "prog") {
      const featureToProgId =
        stepToNode[alg]?.[step] && nodeToProgId[stepToNode[alg][step]];
      const features = Object.keys(featureToProgId ?? "");

      const programs =
        features.length === 0
          ? "no-prog"
          : features.reduce(
              (acc, feature) => {
                /* ToDo - add a map */
                const id = Object.keys(stepToNode).find(
                  (key) => stepToNode[key].name === feature,
                );

                // @ts-ignore
                acc[id] = progIdToProg[featureToProgId[feature]];
                return acc;
              },
              {} as Record<string, string>,
            );

      sendResponse({
        programs,
        name: stepToNode[alg]?.name || "none",
      });
    }
  })();
  return true;
});

async function toggleActivity(tabId: number) {
  const originTabState = await getTabState(tabId);
  await setTabState(tabId, {
    ...originTabState,
    active: !originTabState.active,
  });
}
