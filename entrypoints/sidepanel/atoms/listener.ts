import type { Message } from "@/types/message";
import type { createStore } from "jotai";
import { messageCountAtom, selectionAtom, callStackAtom } from "./app";
import {
  CUSTOM_EVENT_CALLSTACK_UPDATE,
  CUSTOM_EVENT_SDO_SELECTION,
  CUSTOM_EVENT_SELECTION,
  Selection,
} from "@/types/custom-event";
import { Context } from "@/types/data";

/**
 * This function is used to listen for messages from the runtime,
 * to update the state of the sidepanel (inside `store`).
 *
 * @access store, sidepanel, runtime
 *
 * @returns true
 */
export const createMessageListener = function (
  store: ReturnType<typeof createStore>,
) {
  return function (
    message: Message,
    sender: Browser.runtime.MessageSender,
    sendResponse: (response?: unknown) => void,
  ): true {
    // TODO : check this line
    if (sendResponse) sendResponse({ success: true });

    // 메시지가 사이드 패널용인지 확인
    run(async () => {
      const { from, payload } = message;

      store.set(messageCountAtom, (prev) => prev + 1);

      if (from === "content") {
        const tabId = sender.tab?.windowId;
        const thisWindowId = (await browser.windows.getCurrent())?.id;
        const fromSameWindow = tabId === thisWindowId && tabId !== undefined;
        console.log("same window?", fromSameWindow);
        if (!fromSameWindow) {
          console.warn("message from content script, but not from same window");
          return;
        }
      }

      store.set(messageCountAtom, (prev) => prev + 1);

      switch (payload.type) {
        case CUSTOM_EVENT_SELECTION:
          // TODO reason through type system
          store.set(selectionAtom, payload.dataSelection as Selection);
          break;

        case CUSTOM_EVENT_SDO_SELECTION:
          store.set(selectionAtom, null);
          break;

        case CUSTOM_EVENT_CALLSTACK_UPDATE:
          {
            const callStack = store.get(callStackAtom);
            store.set(
              callStackAtom,
              // TODO validate
              computePushResult(callStack, payload.dataCallstack as Context),
            );
          }
          break;

        default:
          break;
      }
    });

    // 리스너를 유지하기 위해 true 반환 (비동기 응답을 위해)
    return true;
  };
};

function run<T>(f: () => Promise<T>) {
  f();
}

function __context_contains(current: Context[], node: Context) {
  return current.some((iter) => iter.callerId == node.callerId);
}

function computePushResult(current: Context[], node: Context) {
  if (current.at(-1)?.calleeId !== node.callerId) current = [];

  if (__context_contains(current, node)) {
    while (current.length > 0) {
      if (current.at(-1)?.callerId == node.callerId) break;
      current.pop();
    }
  } else current.push(node);

  return [...current];
}
