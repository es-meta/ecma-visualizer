import { GitHubIcon } from "@/entrypoints/sidepanel/icons";

const logo = browser.runtime.getURL("/images/logo.jpeg");

export function Header() {
  return (
    <header className="flex flex-row items-center justify-between px-2 py-2">
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
