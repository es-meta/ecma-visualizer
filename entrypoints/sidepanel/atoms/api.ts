import {
  fetchAllTest262ByNodeId,
  fetchFNCByNodeId,
  fetchMinimalScriptByNodeId,
  fetchScriptByProgId,
  fetchStepToNodeId,
  fetchTest262FNCByNodeId,
  fetchTest262NameByTest262Id,
} from "../util/api";

import { atomFamily } from "jotai/utils";
import { atomWithSuspenseQuery } from "jotai-tanstack-query";
import { secIdToFuncIdAtom, test262IdToTest262Atom } from "./resources";
import { getQueryClient } from "./qc";

type QueryOption = Omit<
  Parameters<typeof atomWithSuspenseQuery>[0],
  "queryKey" | "queryFn"
>;

const option: QueryOption = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchInterval: 1000 * 60 * 5, // 5 minutes
  retry: false,
};

export const fetchAllTest262ByNodeIdAtom = atomFamily((nodeId: number) =>
  atomWithSuspenseQuery(
    (get) => ({
      queryKey: ["test262", nodeId],
      queryFn: catchAsNull(async () => {
        const test262IdToTest262 = await get(test262IdToTest262Atom);
        return await fetchAllTest262ByNodeId(nodeId, test262IdToTest262);
      }),
      ...option,
    }),
    getQueryClient,
  ),
);

export const fetchFNCByNodeIdAtom = atomFamily((nodeId: number) =>
  atomWithSuspenseQuery(
    () => ({
      queryKey: ["fnc", nodeId],
      queryFn: catchAsNull(async () => {
        return await fetchFNCByNodeId(nodeId);
      }),
      ...option,
    }),
    getQueryClient,
  ),
);

export const fetchMinimalScriptByNodeIdAtom = atomFamily((nodeId: number) =>
  atomWithSuspenseQuery(
    () => ({
      queryKey: ["minimalScript", nodeId],
      queryFn: catchAsNull(async () => {
        return await fetchMinimalScriptByNodeId(nodeId);
      }),
      ...option,
    }),
    getQueryClient,
  ),
);

export const fetchScriptByProgIdAtom = atomFamily(
  ([progId, stepCount]: [number, number]) =>
    atomWithSuspenseQuery(
      () => ({
        queryKey: ["script", progId, stepCount],
        queryFn: catchAsNull(async () => {
          return await fetchScriptByProgId(progId, stepCount);
        }),
        ...option,
      }),
      getQueryClient,
    ),
);

export const fetchStepToNodeIdAtom = atomFamily(
  ([secId, step]: [string, string]) =>
    atomWithSuspenseQuery(
      (get) => ({
        queryKey: ["stepToNodeId", secId, step],
        queryFn: catchAsNull(async () => {
          const secIdToFuncId = await get(secIdToFuncIdAtom);
          return await fetchStepToNodeId(secId, step, secIdToFuncId);
        }),
        ...option,
      }),
      getQueryClient,
    ),
);

export const fetchTest262FNCByNodeIdAtom = atomFamily((nodeId: number) =>
  atomWithSuspenseQuery(
    () => ({
      queryKey: ["test262FNC", nodeId],
      queryFn: catchAsNull(async () => {
        return await fetchTest262FNCByNodeId(nodeId);
      }),
      ...option,
    }),
    getQueryClient,
  ),
);

export const fetchTest262NameByTest262IdAtom = atomFamily((test262Id: string) =>
  atomWithSuspenseQuery(
    (get) => ({
      queryKey: ["test262Name", test262Id],
      queryFn: catchAsNull(async () => {
        const test262IdToTest262 = await get(test262IdToTest262Atom);
        return await fetchTest262NameByTest262Id(test262Id, test262IdToTest262);
      }),
      ...option,
    }),
    getQueryClient,
  ),
);

// adhoc fix: https://github.com/jotaijs/jotai-tanstack-query/issues/96
function catchAsNull<T, A extends unknown[]>(
  fn: (...args: A) => Promise<T | null>,
) {
  return async function (...args: A): Promise<T | null> {
    try {
      return await fn(...args);
    } catch {
      return null;
    }
  };
}
