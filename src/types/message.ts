import { ExtensionState, TabState } from "./extension-state.ts";

export type MessageType = "init" | "prog";

export type Message = { check: string[] } & (ExtensionState | TabState);

type FeatureToProg = Record<string, string>;
export type ProgramResponse = {
  programs: FeatureToProg;
  name: string;
};
