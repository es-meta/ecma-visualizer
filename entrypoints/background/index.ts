import { setExtensionState } from "./extension-state";

export default defineBackground(() => {
  browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

  browser.runtime.onInstalled.addListener(async () => {
    await setExtensionState({
      installType: (await browser.management.getSelf()).installType,
    });

    const tabs = await browser.tabs.query({});
    for (const tab of tabs) {
      if (!tab.id || !tab.url) return;
      await enableChromeButton(tab.id, tab.url);
    }
  });

  browser.tabs.onUpdated.addListener(
    (tabId: number, changeInfo: Browser.tabs.TabChangeInfo) => {
      logger.log("tab updated", changeInfo);
      (async () => {
        if (changeInfo.url) await enableChromeButton(tabId, changeInfo.url);
        if (changeInfo.status === "loading") {
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
    } else {
      await browser.action.disable(tabId);
    }
  }
});
