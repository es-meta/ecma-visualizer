type InstallType = "admin" | "development" | "normal" | "sideload" | "other";

export type TabState = {
  active: boolean;
};

export type TabIdStatePair = Record<number, TabState>;

export type StepToNode = Record<string, Record<string, string>>;
export type NodeToProgId = Record<string, Record<string, string>>;
export type NodeToProgId2 = Record<
  string,
  Record<string, Record<string, string>>
>;
export type ProgIdToProg = Record<string, string>;

export type ExtensionState = {
  installType: InstallType;
  stepToNode: StepToNode;
  nodeToProgId: NodeToProgId;
  progIdToProg: ProgIdToProg;
} & TabIdStatePair;

export const DEFAULT_EXTENSION_STATE: ExtensionState = {
  installType: "normal",
  stepToNode: {},
  nodeToProgId: {},
  progIdToProg: {},
};

export const DEFAULT_TAB_STATE: TabState = {
  active: false,
};

/* TypeGuards */

function isRecStrStr(obj: unknown): obj is Record<string, string> {
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

export function isExtensionState(obj: unknown): obj is ExtensionState {
  if (typeof obj !== "object" || obj === null) return false;

  const candidate = obj as Record<string, unknown>;

  if (typeof candidate.installType !== "string") return false;
  if (!isRecStrRecStrStr(candidate.stepToNode)) return false;
  if (!isRecStrRecStrStr(candidate.nodeToProgId)) return false;
  if (!isRecStrStr(candidate.progIdToProg)) return false;

  const tabIdStateEntries = Object.entries(candidate).filter(
    ([key]) =>
      key !== "installType" &&
      key !== "stepToNode" &&
      key !== "nodeToProgId" &&
      key !== "progIdToProg",
  );

  return isTabIdStatePair(Object.fromEntries(tabIdStateEntries));
}

function isTabIdStatePair(obj: unknown): obj is TabIdStatePair {
  if (typeof obj !== "object" || obj === null) return false;

  for (const [key, value] of Object.entries(obj)) {
    if (isNaN(Number(key))) {
      return false;
    }
    if (!isTabState(value)) {
      return false;
    }
  }

  return true;
}

export function isTabState(obj: unknown): obj is TabState {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as TabState).active === "boolean"
  );
}
