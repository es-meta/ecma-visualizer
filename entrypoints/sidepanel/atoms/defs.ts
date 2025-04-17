import { atom } from "jotai";
import { atomWithLazy } from "jotai/utils";

// Atoms for PoC

// 메시지 카운트를 저장할 atom 생성
export const messageCountAtom = atom(0);
export const messagesAtom = atom<unknown[]>([]);

// moved from `useSelection`
// TODO import Selection type from proper file
export const selectionAtom = atom<Selection | null>(null);
export const sdoWaitingAtom = atom<boolean>(false);

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

// moved from `useProgram`
