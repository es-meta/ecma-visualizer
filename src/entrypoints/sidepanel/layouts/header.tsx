import { GitHubIcon } from "@/entrypoints/sidepanel/icons";
import { devModeAtom } from "../atoms/dev";

const logo = browser.runtime.getURL("/images/logo.jpeg");

export function Header() {
  const [dev, setDev] = useAtom(devModeAtom);

  return (
    <header
      className="flex flex-row items-center justify-between px-2 py-2"
      onClick={(e) => {
        if (e.metaKey && e.shiftKey) {
          setDev((dev) => !dev);
        }
      }}
    >
      <div className="flex flex-row items-center justify-start gap-1 text-sm">
        <a
          href={import.meta.env.VITE_ESMETA_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={logo} className="size-6 rounded-md" />
          <b className="font-extrabold">ESMeta</b>
        </a>
        <span>ECMA Visualizer</span>
      </div>
      {dev && "🟢 dev mode"}
      <div className="flex flex-row items-center justify-end gap-1">
        <a
          className="text-lg"
          href={import.meta.env.VITE_ESMETA_GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubIcon />
        </a>
      </div>
    </header>
  );
}
