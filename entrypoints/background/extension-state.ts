import {
  DEFAULT_EXTENSION_STATE,
  DEFAULT_TAB_STATE,
  ExtensionState,
  isExtensionState,
  isTabState,
  TabState,
} from "@/types/extension-state";
import { Message } from "@/types/message";

// chrome.storage.onChanged.addListener((changes, areaName) => {
//   if (areaName !== "session") return;
//   (async () => {
//     for (const key of Object.keys(changes)) {
//       const val = changes[key].newValue;
//       if (isTabState(val) && !isNaN(Number(key)))
//         await toggleIcon(Number(key), val.active);
//     }
//   })();
// });

// export async function getTabState(tabId: number): Promise<TabState> {
//   const { [tabId]: tabState = { ...DEFAULT_TAB_STATE } } =
//     await getExtensionState();

//   return tabState;
// }

// export async function setTabState(tabId: number, tabState: TabState) {
//   await setExtensionState({ [tabId]: tabState });
// }

// export async function getExtensionState(): Promise<ExtensionState> {
//   const obj = await chrome.storage.session.get();
//   return isExtensionState(obj) ? obj : { ...DEFAULT_EXTENSION_STATE };
// }

// export async function setExtensionState(state: object) {
//   const extensionState = await getExtensionState();

//   await chrome.storage.session.set({
//     ...extensionState,
//     ...state,
//   });
// }

// async function toggleIcon(tabId: number, isActive: boolean) {
//   if (isActive)
//     await browser.action.setIcon({
//       path: "images/icon-16.png",
//       tabId: tabId,
//     });
//   else
//     await browser.action.setIcon({
//       path: "images/dimmed-icon-16.png",
//       tabId: tabId,
//     });
// }
