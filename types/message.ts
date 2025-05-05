type Runtime = "background" | "content" | "sidepanel";

export interface Message {
  from: Runtime;
  payload: MessagePayload;
}

export type MessagePayload = {
  type: string;
  [key: string]: unknown;
};
