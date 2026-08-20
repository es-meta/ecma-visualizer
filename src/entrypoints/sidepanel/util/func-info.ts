import { type Context, type SecIdToFunc } from "@/types/data";

type FuncInfo = NonNullable<SecIdToFunc[string]>;

const UNKNOWN: FuncInfo = [-1, "", []];

// `_NativeError_`, `_TypedArray_`: one spec section, one CFG function per instance
export function isTemplateFuncInfo(info: SecIdToFunc[string]): boolean {
  const [, name] = info ?? UNKNOWN;
  return /^_\w+_$/.test(name);
}

export function getAllFuncIds(info: SecIdToFunc[string]): number[] {
  const [id, , rest] = info ?? UNKNOWN;
  return [...new Set([id, ...rest])].filter((funcId) => funcId >= 0);
}

function getFrameFuncIds(info: SecIdToFunc[string]): number[] {
  if (isTemplateFuncInfo(info)) return getAllFuncIds(info);
  const [id] = info ?? UNKNOWN;
  return id >= 0 ? [id] : [];
}

export type CallPathCandidates = ReadonlyArray<ReadonlySet<string>>;

export function getCallPathCandidates(
  callStack: Context[],
  map: SecIdToFunc,
): CallPathCandidates {
  return callStack.map(
    ({ callerId, step }) =>
      new Set(getFrameFuncIds(map[callerId]).map((id) => `${id}|${step}`)),
  );
}

// a recorded call path matches when it extends the call stack frame by frame
function matchesCallPath(
  path: string,
  candidates: CallPathCandidates,
): boolean {
  const frames = path.split("-");
  return (
    frames.length >= candidates.length &&
    candidates.every((allowed, index) => allowed.has(frames[index]))
  );
}

export function findMatchingCallPathValues<T>(
  maps: ReadonlyArray<Record<string, T>>,
  candidates: CallPathCandidates,
): T[] {
  return maps.flatMap((map) =>
    Object.entries(map)
      .filter(([path]) => matchesCallPath(path, candidates))
      .map(([, value]) => value),
  );
}
