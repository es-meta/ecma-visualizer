import { currentTabSupported } from "../atoms/app";

export function NotifyStrip() {
  const [isSupported, setIsSupported] = useAtom(currentTabSupported);

  useEffect(() =>
    fire(async () => {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      const activeTab = tabs.at(0);
      if (activeTab) {
        setIsSupported(
          activeTab.url ? url.isSupportedSpec(activeTab.url) : false,
        );
      }
    }),
  );

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
        ⚠️ Current tab is not supported
      </button>
    </aside>
  );
}
