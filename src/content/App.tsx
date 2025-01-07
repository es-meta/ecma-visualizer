import Visualizer, { EmptyVisualizer } from "./Visualizer/Visualizer.tsx";
import { ReactNode, useEffect, useState } from "react";
import IndexedDb from "./util/indexed-db.ts";
import { Frown, LoaderPinwheel } from "lucide-react";

const logo = chrome.runtime.getURL("images/logo.jpeg");

const tables: Table[] = [
  "ecId-to-func",
  "func-to-ecId",
  "node-to-progId",
  "progId-to-prog",
  "step-to-node",
  "alg-to-feature",
];
export type Table =
  | "ecId-to-func"
  | "func-to-ecId"
  | "node-to-progId"
  | "progId-to-prog"
  | "step-to-node"
  | "alg-to-feature";

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
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="overflow-hidden flex flex-col flex-auto divide-neutral-300 divide-y fixed w-dvw h-[400px] bottom-0 left-0 z-[999] bg-[#f5f5f5] shadow-[0_-2px_4px_rgba(0,0,0,0.1)]">
      <VisualizerHeader />
      {loading && <Loading />}
      {idxDb ? (
        <Visualizer db={idxDb} />
      ) : error ? (
        <Error />
      ) : (
        <EmptyVisualizer />
      )}
    </section>
  );
};

const Loading = () => {
  return (
    <div className="absolute z-[999] bg-black bg-opacity-35 w-full h-full top-0 left-0 flex-auto flex justify-center items-center">
      <div className="flex flex-row items-center gap-3">
        <LoaderPinwheel className="animate-spin w-8 h-8" />
        <div className="m-0 p-0 flex flex-col justify-start">
          <p className="m-0 p-0 text-xl font-bold">Initializing</p>
          <p className="m-0 p-0 text-base">Please wait a second..</p>
        </div>
      </div>
    </div>
  );
};

const Error = () => {
  return (
    <div className="flex-auto flex justify-center items-center">
      <div className="flex flex-row items-center gap-3">
        <Frown className="w-7 h-7" />
        <div className="m-0 p-0 flex flex-col justify-start">
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
    <header className="bg-white text-sm py-2 px-4 flex flex-row items-center justify-between">
      <div className="flex flex-row gap-2 items-center">
        <img src={logo} className="h-6 w-6" />
        <div className="font-extrabold text-base">ESMeta</div>
        <div className="font-normal text-base">ECMA Visualizer</div>
      </div>
      <div className="flex flex-row gap-2 items-center">
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
      className="flex !text-black hover:text-black flex-row gap-1 items-center text-xs font-500 hover:bg-neutral-100 hover:no-underline rounded-lg active:scale-90 transition-all cursor-pointer p-2"
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
