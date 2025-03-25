import { ExtensionState, TabState } from "./extension-state.ts";

export type MessageType = "init" | "prog";

export type Message = { check: string[] } & (ExtensionState | TabState);

export type Selection = {
  secId: string;
  step: string;
};
