import Visualizer from "./Visualizer/Visualizer.tsx";
import { ReactNode, useEffect, useState } from "react";
import IndexedDb, { Table } from "./util/indexed-db.ts";
import { Frown, LoaderCircle } from "lucide-react";

const tables: Table[] = [
  "nodeId-to-test262",
  "step-to-nodeId",
  "nodeId-to-progId",
  "progId-to-prog",
  "func-to-ecId",
  "ecId-to-func",
  "funcId-to-func",
  "func-to-funcId",
  "func-to-sdo",
  "ecId-to-algo-name",
  "testId-to-test262",
];

const logo = chrome.runtime.getURL("images/logo.jpeg");

const App = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [idxDb, setIdxDb] = useState<IndexedDb | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const db = new IndexedDb("myDb");
        await db.createObjectStore(tables);
        const promises = tables.map((table) =>
          db.saveJson(table, `resources/${table}.json`),
        );
        await Promise.all(promises);

        setIdxDb(db);
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="relative flex size-full flex-auto flex-col divide-y divide-neutral-300 overflow-scroll bg-[#f5f5f5] shadow-[-4px_0_4px_rgba(0,0,0,0.1)]">
      <VisualizerHeader />
      {loading && <Loading />}
      {idxDb && <Visualizer db={idxDb} />}
      {error && <Error />}
    </section>
  );
};

export const Loading = () => {
  return (
    <div className="absolute left-0 top-0 z-[900] flex size-full items-center justify-center bg-[#ccc] bg-opacity-35">
      <LoaderCircle className="h-10 w-10 animate-spin font-bold text-[#E79118]" />
    </div>
  );
};

const Error = () => {
  return (
    <div className="flex flex-auto items-center justify-center">
      <div className="flex flex-row items-center gap-3">
        <Frown className="h-7 w-7" />
        <div className="m-0 flex flex-col justify-start p-0">
          <p className="m-0 p-0 text-lg">Sorry something went wrong</p>
          <p className="m-0 p-0 text-sm">
            Help us improve ECMA Visualizer by reporting the issue
          </p>
        </div>
      </div>
    </div>
  );
};

const VisualizerHeader = () => {
  return (
    <header className="z-[999] flex flex-row items-center justify-between bg-white px-4 py-2 text-sm">
      <div className="flex flex-row items-center gap-2">
        <img src={logo} className="h-6 w-6" />
        <div className="text-base font-extrabold">ESMeta</div>
        <div className="text-base font-normal">ECMA Visualizer</div>
      </div>
      <div className="flex flex-row items-center gap-2">
        <A href="https://github.com/es-meta/esmeta">
          <GitHubIcon />
          ESMeta
        </A>
        <A href="https://github.com/ku-plrg/ecma-visualizer">
          <GitHubIcon />
          ECMA Visualizer
        </A>
      </div>
    </header>
  );
};

const A = ({ href, children }: { href: string; children: ReactNode }) => {
  return (
    <a
      href={href}
      target="_blank"
      className="font-500 flex cursor-pointer flex-row items-center gap-1 rounded-lg p-2 text-xs !text-black transition-all hover:bg-neutral-100 hover:text-black hover:no-underline active:scale-90"
    >
      {children}
    </a>
  );
};

function GitHubIcon() {
  return (
    <svg
      aria-disabled
      fill="currentColor"
      width={14}
      height={14}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>GitHub</title>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export default App;
