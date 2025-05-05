import { FuncNameNode } from "@/types/data";
import { atom } from "jotai";
import { atomWithLazy } from "jotai/utils";
import { type Selection } from "@/types/custom-event";
import {
  fetchAllTest262ByNodeId,
  fetchFNCByNodeId,
  fetchMinimalScriptByNodeId,
  fetchScriptByProgId,
  fetchStepToNodeId,
  fetchTest262FNCByNodeId,
  fetchTest262NameByTest262Id,
} from "../util/api";
import { Atom } from "jotai";
import { convertToIndex, getBitString } from "../util/decode";

// 메시지 카운트를 저장할 atom 생성
export const messageCountAtom = atom(0);

// moved from `useSelection`
// TODO import Selection type from proper file
export const selectionAtom = atom<Selection | null>(null);
export const sdoWaitingAtom = atom<boolean>((get) => {
  const selection = get(selectionAtom);
  return selection === null;
});

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

// derived atom
export const convertedCallStackAtom = atom<Promise<FuncNameNode[]>>(
  async (get) => {
    const callStack = get(callStackAtom);
    const nameMap = await get(secIdToFuncNameAtom);

    return callStack.reverse().map((n) => {
      return {
        callerName: nameMap[n.callerId],
        step: n.step,
      };
    });
  },
);

export const programAtom: Atom<Promise<readonly [string, number]>> = atom(
  async (get) => {
    const selection = get(selectionAtom);
    const secIdToFuncId = await get(secIdToFuncIdAtom);

    if (!selection) {
      return ["", 0] as const;
    }
    const callstack = get(callStackAtom);

    const nodeIds = await fetchStepToNodeId(
      selection.secId,
      selection.step,
      secIdToFuncId,
    );

    if (callstack.length === 0) {
      return await fetchMinimalScriptByNodeId(nodeIds[0]);
    } else {
      const currentCp = await get(convertedToIdCallStackAtom);
      const featureToProgIDArr = await Promise.all(
        nodeIds.map((nid) => fetchFNCByNodeId(nid)),
      );
      const cpMap = featureToProgIDArr.flatMap((featureToProgId) =>
        Object.values(featureToProgId),
      );

      let progId: [number, number] | null = null;
      cpMap.some((cp) => {
        const foundCP = Object.keys(cp).find((c) => c.startsWith(currentCp));
        if (foundCP) {
          progId = cp[foundCP];
          return true;
        }
      });

      if (progId) {
        return await fetchScriptByProgId(progId[0], progId[1]);
      } else {
        throw Error("NotFound");
      }
    }
  },
);
export const test262Atom = atom<Promise<string[]>>(async (get) => {
  const selection = get(selectionAtom);
  const secIdToFuncId = await get(secIdToFuncIdAtom);
  const callstack = get(callStackAtom);
  const test262IdToTest262 = await get(test262IdToTest262Atom);

  // TODO
  if (!selection) return [];

  const nodeIds = await fetchStepToNodeId(
    selection.secId,
    selection.step,
    secIdToFuncId,
  );

  if (callstack.length === 0) {
    return await fetchAllTest262ByNodeId(nodeIds[0], test262IdToTest262);
  } else {
    const currentCp = await get(convertedToIdCallStackAtom);
    const featureToTest262IDArr = await Promise.all(
      nodeIds.map((nid) => fetchTest262FNCByNodeId(nid)),
    );
    const cpMap = featureToTest262IDArr.flatMap((featureToProgId) =>
      Object.values(featureToProgId),
    );

    let test262Encode: string | null = null;
    cpMap.some((cp) => {
      const foundCP = Object.keys(cp).find((c) => c.startsWith(currentCp));

      if (foundCP) {
        test262Encode = cp[foundCP];
        return true;
      }
    });

    if (test262Encode) {
      const bitString = getBitString(test262Encode);
      return await Promise.all(
        convertToIndex(bitString).map((testId) =>
          fetchTest262NameByTest262Id(testId, test262IdToTest262),
        ),
      );
    } else {
      throw new Error("NotFound");
    }
  }
});

import { Context } from "../../../types/data";
import { SetStateAction } from "jotai";

const _node = atom<Context[]>([]);

export const callStackAtom = atom<Context[], [SetStateAction<Context[]>], void>(
  (get) => get(_node),
  (get, set, update: SetStateAction<Context[]>) => {
    set(_node, update);
  },
);

/* callstacks */

export const convertedToNameCallStackAtom = atom(async (get) => {
  const callStack = get(callStackAtom);
  const secIdToFuncName = await get(secIdToFuncNameAtom);

  return callStack.reverse().map((n) => {
    return {
      callerName: secIdToFuncName[n.callerId],
      step: n.step,
    };
  });
});

export const convertedToIdCallStackAtom = atom(async (get) => {
  const callStack = get(callStackAtom);
  const secIdToFuncId = await get(secIdToFuncIdAtom);

  return callStack
    .map((n) => {
      return `${secIdToFuncId[n.callerId]}|${n.step}`;
    })
    .join("-");
});
