import TabChangeInfo = chrome.tabs.TabChangeInfo;
import {
  getExtensionState,
  getTabState,
  setExtensionState,
  setTabState,
} from "./extension-state.ts";

const ECMA_20204_URL: string = "https://tc39.es/ecma262/2024/";

chrome.runtime.onInstalled.addListener(() => {
  (async () => {
    await setExtensionState({
      installType: (await chrome.management.getSelf()).installType,
    });

    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (!tab.id || !tab.url) return;
      await enableChromeButton(tab.id, tab.url);
    }

    chrome.storage.local.set({
      secIdToFuncName: await fetch(
        chrome.runtime.getURL("resources/secIdToFuncName.json"),
      ).then((res) => res.json()),
      secIdToFuncId: await fetch(
        chrome.runtime.getURL("resources/secIdToFuncId.json"),
      ).then((res) => res.json()),
      test262IdToTest262: await fetch(
        chrome.runtime.getURL("resources/test262IdToTest262.json"),
      ).then((res) => res.json()),
    });
  })();
});

chrome.tabs.onUpdated.addListener(
  (tabId: number, changeInfo: TabChangeInfo) => {
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
    const { msgTyp } = msg;
    const { installType, ...tabs } = await getExtensionState();

    if (msgTyp === "init")
      sendResponse({
        installType: installType,
        active: sender.tab?.id ? tabs[sender.tab.id].active : false,
      });
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
