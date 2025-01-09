type InstallType = "admin" | "development" | "normal" | "sideload" | "other";

export type TabState = {
  active: boolean;
};

export type TabIdStatePair = Record<number, TabState>;

export type ExtensionState = {
  installType: InstallType;
} & TabIdStatePair;

export const DEFAULT_EXTENSION_STATE: ExtensionState = {
  installType: "normal",
};

export const DEFAULT_TAB_STATE: TabState = {
  active: false,
};

/* TypeGuards */

export function isExtensionState(obj: unknown): obj is ExtensionState {
  if (typeof obj !== "object" || obj === null) return false;

  const candidate = obj as Record<string, unknown>;

  if (typeof candidate.installType !== "string") return false;

  const tabIdStateEntries = Object.entries(candidate).filter(
    ([key]) => key !== "installType",
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
