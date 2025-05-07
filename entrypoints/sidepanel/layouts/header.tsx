import { GitHubIcon } from "@/entrypoints/sidepanel/icons";
import { QueryClient } from "@tanstack/query-core";
import { useAtom } from "jotai";
import { atomWithSuspenseQuery } from "jotai-tanstack-query";
import { unwrap } from "jotai/utils";
import { Suspense } from "react";

const logo = browser.runtime.getURL("/images/logo.jpeg");

const qcTest = new QueryClient()

const xAtom = atomWithSuspenseQuery(
  () => ({
    queryKey: ["test"],
    queryFn: async () => 1,
  }),
  () => qcTest
)

function Test() {
  const [x, setX] = useAtom(unwrap(xAtom))
  return <div><div>{x?.data}</div><button onClick={setX}>setX</button></div>

}

export function Header() {
  return (
    <header className="flex flex-row items-center justify-between px-2 py-2">
      <div className="flex flex-row items-center justify-start text-sm gap-1">
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
      <Suspense fallback={<div>Loading...</div>}>
        <Test />
      </Suspense>
    </header>
  );
}
