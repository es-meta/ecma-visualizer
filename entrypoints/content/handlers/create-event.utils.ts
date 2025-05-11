import {
  CUSTOM_EVENT_SELECTION,
  CUSTOM_EVENT_CALLSTACK_UPDATE,
  CUSTOM_EVENT_SDO_SELECTION,
} from "@/types/custom-event";
import type { Message } from "@/types/message";
import type { Selection } from "@/types/custom-event";
import { Context } from "@/types/data";

export async function customEventCallStackUpdate(data: Context) {
  browser.runtime.sendMessage({
    from: "content",
    payload: {
      type: CUSTOM_EVENT_CALLSTACK_UPDATE,
      dataCallstack: data,
    },
  } satisfies Message);
}

export async function customEventSelection(selection: Selection) {
  browser.runtime.sendMessage({
    from: "content",
    payload: {
      type: CUSTOM_EVENT_SELECTION,
      dataSelection: selection,
    },
  } satisfies Message);
}

export async function customEventSDOSelection() {
  browser.runtime.sendMessage({
    from: "content",
    payload: {
      type: CUSTOM_EVENT_SDO_SELECTION,
    },
  } satisfies Message);
}
