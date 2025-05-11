import { Message } from "@/types/message";
import { CUSTOM_IS_SUPPORTED } from "@/types/custom-event";

export default defineBackground(() => {
  browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

  browser.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await browser.tabs.get(activeInfo.tabId);

    browser.runtime.sendMessage({
      from: "background",
      targetWindowId: activeInfo.windowId,
      payload: {
        type: CUSTOM_IS_SUPPORTED,
        dataSupported: url.isSupportedSpec(tab.url ?? ""),
      },
    } satisfies Message);
  });
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      browser.runtime.sendMessage({
        from: "background",
        targetWindowId: tab.windowId,
        payload: {
          type: CUSTOM_IS_SUPPORTED,
          dataSupported: url.isSupportedSpec(changeInfo.url ?? ""),
        },
      } satisfies Message);
    }
  });
});
