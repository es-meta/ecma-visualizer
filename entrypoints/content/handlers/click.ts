import {
  MULTIPLEPROD,
  VISCALL,
  VISDEFAULTSDO,
  VISID,
  VISPRODUCTION,
  VISSDOSTEP,
  VISSTEP,
} from "../constants";
import { Selection } from "@/types/custom-event";
import {
  customEventCallStackUpdate,
  customEventSDOSelection,
  customEventSelection,
} from "./create-event.utils";

function extractVisId(visId: string) {
  const [secId, ...stepList] = visId.split("|");
  const step = stepList.join("|");
  return { secId, step };
}

export function handleClick(e: MouseEvent) {
  if (!(e.target instanceof HTMLElement)) return;

  if (e.altKey) {
    const $clicked = e.target.closest(
      `.${VISSTEP}, .${VISSDOSTEP}, .${VISPRODUCTION}`,
    );
    if (!$clicked) return;

    stepClickEvent($clicked);
    e.preventDefault();
  } else {
    if (e.target.classList.contains(VISCALL)) callClickEvent(e.target);
  }
}

let selectionSaver: Selection | null = null;
function stepClickEvent($clickedStep: Element) {
  const visId = $clickedStep.getAttribute(VISID) ?? "";
  if (!visId) logger.error("Must have visId");

  if ($clickedStep.classList.contains(VISSTEP)) {
    selectionSaver = null;
    const { secId, step } = extractVisId(visId);
    customEventSelection({ secId, step });
  } else if ($clickedStep.classList.contains(VISSDOSTEP)) {
    if ($clickedStep.hasAttribute(MULTIPLEPROD)) {
      const { secId, step } = extractVisId(visId);
      selectionSaver = {
        secId,
        step,
      };
      customEventSDOSelection();
    } else {
      const sdo = $clickedStep.getAttribute(VISDEFAULTSDO);
      if (!sdo) logger.error("Must have defaultSDO");
      const { secId, step } = extractVisId(visId);
      customEventSelection({
        secId: `${secId}|${sdo}`,
        step,
      });
    }
  } else if ($clickedStep.classList.contains(VISPRODUCTION)) {
    if (!selectionSaver) return;
    customEventSelection({
      secId: `${selectionSaver.secId}|${visId}`,
      step: selectionSaver.step,
    });
    selectionSaver = null;
  }
}

function callClickEvent($clickedA: Element): boolean {
  const visId = $clickedA.getAttribute(VISID) ?? "";
  const sdo = $clickedA.getAttribute(VISDEFAULTSDO);

  const [callerAndStep, calleeId] = visId.split("->");
  const [callerId, step] = callerAndStep.split("|");

  if (sdo)
    customEventCallStackUpdate({
      callerId: `${callerId}|${sdo}`,
      step,
      calleeId,
    });
  else customEventCallStackUpdate({ callerId, step, calleeId });

  return true;
}
