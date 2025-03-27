export const CUSTOM_EVENT_SELECTION = "selection";
export const CUSTOM_EVENT_SDO_SELECTION = "sdo selection";
export const CUSTOM_EVENT_CALLSTACK_UPDATE = "callstack update";

export type Selection = {
  secId: string;
  step: string;
};

export function customEventCallStackUpdate() {
  window.dispatchEvent(new CustomEvent(CUSTOM_EVENT_CALLSTACK_UPDATE, {}));
}

export function customEventSelection(selection: Selection) {
  window.dispatchEvent(
    new CustomEvent(CUSTOM_EVENT_SELECTION, { detail: selection }),
  );
}

export function customEventSDOSelection() {
  window.dispatchEvent(new CustomEvent(CUSTOM_EVENT_SDO_SELECTION, {}));
}
