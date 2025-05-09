import {
  DEFAULT_EXTENSION_STATE,
  DEFAULT_TAB_STATE,
  ExtensionState,
  isExtensionState,
  TabState,
} from "@/types/extension-state";

export async function getTabState(tabId: number): Promise<TabState> {
  const { [tabId]: tabState = { ...DEFAULT_TAB_STATE } } =
    await getExtensionState();
  return tabState;
}

export async function setTabState(tabId: number, tabState: TabState) {
  await setExtensionState({ [tabId]: tabState });
}

export async function getExtensionState(): Promise<ExtensionState> {
  const obj = await browser.storage.session.get();
  return isExtensionState(obj) ? obj : { ...DEFAULT_EXTENSION_STATE };
}

export async function setExtensionState(state: object) {
  const extensionState = await getExtensionState();
  await browser.storage.session.set({
    ...extensionState,
    ...state,
  });
}
