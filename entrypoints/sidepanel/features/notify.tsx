import { useAtomValue } from "jotai";
import { jotaiStore } from "@/entrypoints/sidepanel/atoms/store";
import { currentTabSupported } from "@/entrypoints/sidepanel/atoms/app";

export function NotifyStrip() {
  const isSupported = useAtomValue(currentTabSupported);

  useEffect(() => {
    fire(async () => {
      const windowId = (await browser.windows.getCurrent())?.id;
      if (windowId === undefined) {
        jotaiStore.set(currentTabSupported, true);
        return;
      }
      const currentTab = (
        await browser.tabs.query({ windowId, active: true })
      ).at(0);
      jotaiStore.set(
        currentTabSupported,
        isUrlSupported(currentTab?.url ?? ""),
      );
    });
  });

  if (isSupported) {
    return null;
  }

  return (
    <aside className="flex h-8 w-full bg-amber-200 dark:bg-amber-800">
      <button
        className="flex size-full flex-row items-center justify-center text-sm"
        onClick={() =>
          alert(
            "ECMA Visualizer currently only supports ECMA-262 2024 (14th Edition). The current page's URL doesn’t seem to be supported.",
          )
        }
      >
        ! Current tab is not supported
      </button>
    </aside>
  );
}
