export type FuncToSdo = Record<string, string>;
export type EcIdToFunc = Record<string, string[]>;
export type FuncToEcId = Record<string, string>;
export type FuncIdToFunc = Record<string, string>;
export type FuncToFuncId = Record<string, number>;
export type EcIdToAlgoName = Record<string, string>;

export type StepToNodeId = Record<string, Record<string, number[]>>;
export type NodeIdToProgId = Record<string, FnCToProgId>;
export type NodeIdToTest262 = Record<string, FnCToTestId>;

export type FnCToProgId = Record<string, CToProgId>;
export type FnCToTestId = Record<string, CToTestId>;
export type CToProgId = Record<string, [number, number]>;
export type CToTestId = Record<string, string>;

export type ProgIdToProg = Record<string, string>;
export type TestIdToTest262 = Record<string, string>;
export type CallIdToFuncId = Record<string, string>;

export function isRecStrStr(obj: unknown): obj is Record<string, string> {
  if (typeof obj !== "object" || obj === null) return false;
  for (const key in obj) {
    if (typeof key !== "string" && typeof obj[key] !== "string") return false;
  }
  return true;
}

export function isRecStrRecStrStr(
  obj: unknown,
): obj is Record<string, Record<string, string>> {
  if (typeof obj !== "object" || obj === null) return false;
  for (const key in obj) {
    if (typeof key !== "string" && isRecStrStr(obj[key])) return false;
  }
  return true;
}
