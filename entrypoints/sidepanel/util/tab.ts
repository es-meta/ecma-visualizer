export async function getCurrentTabId(): Promise<number | undefined> {
  const tabs = await browser.tabs.getCurrent();
  if (tabs) {
    return tabs.id;
  }
  return undefined;
}

export async function getCurrentWindowId(): Promise<number | undefined> {
  const tabs = await browser.tabs.getCurrent();
  if (tabs) {
    return tabs.windowId;
  }
  return undefined;
}
