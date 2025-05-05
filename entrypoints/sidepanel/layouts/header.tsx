import { GitHubIcon } from "@/entrypoints/sidepanel/icons";

const logo = browser.runtime.getURL("/images/logo.jpeg");

export function Header() {
  return (
    <header className="flex flex-row items-center justify-between px-4 py-2 text-sm">
      <div className="flex flex-row items-center gap-2">
        <img src={logo} className="h-6 w-6" />
        <div className="text-base font-extrabold">ESMeta</div>
        <div className="text-base font-normal">ECMA Visualizer</div>
      </div>
      <div className="flex flex-row items-center gap-2">
        <a
          href={import.meta.env.VITE_ESMETA_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubIcon />
        </a>
      </div>
    </header>
  );
}
