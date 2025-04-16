import TabChangeInfo = chrome.tabs.TabChangeInfo;
import {
  getExtensionState,
  getTabState,
  setExtensionState,
  setTabState,
} from "./extension-state";

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });


  // browser.runtime.onInstalled.addListener(() => {
  //   (async () => {
  //     await setExtensionState({
  //       installType: (await chrome.management.getSelf()).installType,
  //     });
  //     const tabs = await chrome.tabs.query({});
  //     for (const tab of tabs) {
  //       if (!tab.id || !tab.url) return;
  //       await enableChromeButton(tab.id, tab.url);
  //     }
  //     chrome.storage.local.set({
  //       secIdToFuncName: await fetch(
  //         chrome.runtime.getURL("resources/secIdToFuncName.json"),
  //       ).then((res) => res.json()),
  //       secIdToFuncId: await fetch(
  //         chrome.runtime.getURL("resources/secIdToFuncId.json"),
  //       ).then((res) => res.json()),
  //       test262IdToTest262: await fetch(
  //         chrome.runtime.getURL("resources/test262IdToTest262.json"),
  //       ).then((res) => res.json()),
  //     });
  //   })();
  // });

  browser.tabs.onUpdated.addListener(
    (tabId: number, changeInfo: TabChangeInfo) => {
      (async () => {
        if (changeInfo.url) await enableChromeButton(tabId, changeInfo.url);
        if (changeInfo.status === "loading") {
          await setTabState(tabId, { active: false });
          await enableChromeButton(
            tabId,
            (await browser.tabs.get(tabId)).url || "",
          );
        }
      })();
    },
  );

  async function enableChromeButton(tabId: number, url: string) {
    const enabledURL = import.meta.env.VITE_ENABLED_SPEC_URL.split(
      "|",
    ) as string[];
    const enable = enabledURL.some((item) => url.includes(item));
    if (enable) {
      await browser.action.enable(tabId);
      await setTabState(tabId, { active: true });
    } else {
      await browser.action.disable(tabId);
      await setTabState(tabId, { active: false });
    }
  }
  /* Extension Icon Event Listener */
  // browser.action.onClicked.addListener((tab) => {
  //   if (!tab.id) return;
  //   toggleActivity(tab.id).catch((e) => console.error(e));
  // });
  // /* Response to content script */
  // browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  //   (async () => {
  //     const { msgTyp } = msg;
  //     const { installType, ...tabs } = await getExtensionState();
  //     if (msgTyp === "init")
  //       sendResponse({
  //         installType: installType,
  //         active: sender.tab?.id ? tabs[sender.tab.id].active : false,
  //       });
  //   })();
  //   return true;
  // });
  // async function toggleActivity(tabId: number) {
  //   const originTabState = await getTabState(tabId);
  //   await setTabState(tabId, {
  //     ...originTabState,
  //     active: !originTabState.active,
  //   });
  // }

  ////// legacy code end //////

  browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true, });

  

  browser.tabs.onUpdated.addListener(async (tabId, info, tab) => {
    if (!tab.url) return;

    // if (SIDEPANEL_MATCH_PATTERN.includes(tab.url)) {
    //   // Enables the side panel on google.com
    //   await browser.sidePanel.setOptions({
    //     tabId,
    //     path: "wxt-sidepanel.html",
    //     enabled: true,
    //   });
    // } else {
      // Disables the side panel on all other sites
    await browser.sidePanel.setOptions({
      tabId,
      enabled: true,
    }).then(() => console.log("Enabled side panel"))
      .catch(() => console.log("Failed to enable side panel"));
    // }
  });
});
