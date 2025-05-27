import type { SecIdToFunc, Test262IdToTest262 } from "@/types/data";
import { atomWithLazy } from "jotai/utils";

export const secIdToFuncAtom = atomWithLazy<Promise<SecIdToFunc>>(
  async () =>
    await fetch(browser.runtime.getURL("/resources/secIdToFunc.json")).then(
      (res) => res.json(),
    ),
);

export const test262IdToTest262Atom = atomWithLazy<Promise<Test262IdToTest262>>(
  async () =>
    await fetch(
      browser.runtime.getURL("/resources/test262IdToTest262.json"),
    ).then((res) => res.json()),
);
