import { CUSTOM_IS_SUPPORTED } from "./custom-event";

export type Message = {
  payload: MessagePayload;
} & (
  | {
      from: "background";
      targetWindowId?: number;
    }
  | {
      from: "content" | "sidepanel";
    }
);

type MessageTypeKnown = typeof CUSTOM_IS_SUPPORTED;

export type MessagePayload =
  | {
      type: typeof CUSTOM_IS_SUPPORTED;
      dataSupported: boolean;
    }
  | {
      type: Exclude<string, MessageTypeKnown>;
      [key: string]: unknown;
    };
