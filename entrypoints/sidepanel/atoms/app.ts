import { FuncNameNode } from "@/types/data";
import { atom } from "jotai";
import { type Selection } from "@/types/custom-event";
import { Atom } from "jotai";
import { convertToIndex, getBitString } from "../util/decode";

import { Context } from "../../../types/data";
import { SetStateAction } from "jotai";
import {
  fetchAllTest262ByNodeIdAtom,
  fetchFNCByNodeIdAtom,
  fetchMinimalScriptByNodeIdAtom,
  fetchScriptByProgIdAtom,
  fetchStepToNodeIdAtom,
  fetchTest262FNCByNodeIdAtom,
  fetchTest262NameByTest262IdAtom,
} from "./api";
import { secIdToFuncIdAtom, secIdToFuncNameAtom } from "./resources";
import { AtomWithSuspenseQueryResult } from "jotai-tanstack-query";
import { DefaultError } from "@tanstack/query-core";

export const currentTabSupported = atom(false);

// 메시지 카운트를 저장할 atom 생성
export const messageCountAtom = atom(0);

// moved from `useSelection`
// TODO import Selection type from proper file
const _selectionAtomInternal = atom<Selection | null>(null);
export const selectionStringifiedAtom = atom<string>((get) =>
  JSON.stringify(get(_selectionAtomInternal)),
);
export const selectionAtom = atom<Selection | null, [Selection | null], void>(
  (get) => {
    return get(_selectionAtomInternal);
  },
  (get, set, update: Selection | null) => {
    if (get(selectionStringifiedAtom) !== JSON.stringify(update)) {
      set(_selectionAtomInternal, update);
    }
  },
);
export const sdoWaitingAtom = atom<boolean>((get) => {
  const selection = get(selectionAtom);
  return selection === null;
});

// derived atom
export const convertedCallStackAtom = atom<Promise<FuncNameNode[]>>(
  async (get) => {
    const callStack = get(callStackAtom);
    const nameMap = await get(secIdToFuncNameAtom);

    return callStack.map((n) => {
      return {
        callerName: nameMap[n.callerId],
        step: n.step,
      };
    });
  },
);

export const programAtom: Atom<Promise<readonly [string, number] | Error>> =
  atom(
    recover(async (get) => {
      const selection = get(selectionAtom);
      const callstack = get(callStackAtom);

      if (!selection) throw waitingSdoError();

      const nodeIds = checkNonNull(
        await get(fetchStepToNodeIdAtom([selection.secId, selection.step])),
      );

      // Adhoc fix
      if (nodeIds === undefined) throw notFoundError();

      if (callstack.length === 0) {
        // TODO : handle error
        return checkNonNull(
          await get(fetchMinimalScriptByNodeIdAtom(nodeIds[0])),
        );
      } else {
        const currentCp = await get(convertedToIdCallStackAtom);
        const featureToProgIDArr = await Promise.all(
          nodeIds.map(async (nid) =>
            checkNonNull(await get(fetchFNCByNodeIdAtom(nid))),
          ),
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
          return checkNonNull(
            await get(fetchScriptByProgIdAtom([progId[0], progId[1]])),
          );
        } else {
          throw notFoundError();
        }
      }
    }),
  );
export const test262Atom = atom<Promise<string[] | Error>>(
  recover(async (get) => {
    const selection = get(selectionAtom);
    const callstack = get(callStackAtom);

    // TODO
    if (!selection) throw waitingSdoError();

    const nodeIds = checkNonNull(
      await get(fetchStepToNodeIdAtom([selection.secId, selection.step])),
    );

    if (callstack.length === 0) {
      return checkNonNull(await get(fetchAllTest262ByNodeIdAtom(nodeIds[0])));
    }
    const currentCp = await get(convertedToIdCallStackAtom);
    const featureToTest262IDArr = await Promise.all(
      nodeIds.map(async (nid) => {
        return checkNonNull(await get(fetchTest262FNCByNodeIdAtom(nid)));
      }),
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
        convertToIndex(bitString).map(async (testId) => {
          return checkNonNull(
            await get(fetchTest262NameByTest262IdAtom(testId)),
          );
        }),
      );
    } else {
      throw notFoundError();
    }
  }),
);

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

  return callStack.map((n) => {
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

function checkNonNull<TData = unknown, TError = DefaultError>(
  atom: Awaited<AtomWithSuspenseQueryResult<TData, TError>>,
): NonNullable<TData> {
  const { data } = atom;
  if (data !== null && data !== undefined) {
    return data;
  }
  if (data === undefined) {
    // adhoc fix: https://github.com/jotaijs/jotai-tanstack-query/issues/96
    logger.error("warning: might fall in infinite loop.");
  }
  throw notFoundError();
}

export function recover<T, A extends unknown[]>(
  f: (...args: A) => Promise<T>,
): (...args: A) => Promise<T | CustomError> {
  return async (...args: A) => {
    try {
      return await f(...args);
    } catch (e) {
      if (e instanceof CustomError) return e;
      else {
        logger.error("Unknown Error Propagted", e);
        return unknownError();
      }
    }
  };
}
