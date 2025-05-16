import { atomWithLazy } from "jotai/utils";

// moved from `useStorage`
export const secIdToFuncNameAtom = atomWithLazy(
  async () =>
    await fetch(browser.runtime.getURL("/resources/secIdToFuncName.json")).then(
      (res) => res.json(),
    ),
);

export const secIdToFuncIdAtom = atomWithLazy(
  async () =>
    await fetch(browser.runtime.getURL("/resources/secIdToFuncId.json")).then(
      (res) => res.json(),
    ),
);

export const test262IdToTest262Atom = atomWithLazy(
  async () =>
    await fetch(
      browser.runtime.getURL("/resources/test262IdToTest262.json"),
    ).then((res) => res.json()),
);
