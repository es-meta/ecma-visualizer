export type ecIdToFunc = Record<string, string>;
export type funcToEcId = Record<string, string>;

export type StepToNode = Record<string, Record<string, string>>;
export type NodeToProgId = Record<string, FnCToProgId>;
export type ProgIdToProg = Record<string, string>;

export type FnCToProgId = Record<string, Record<string, [string, number]>>;

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
