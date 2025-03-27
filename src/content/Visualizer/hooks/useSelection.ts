import { useState, useEffect } from "react";
import {
  CUSTOM_EVENT_SDO_SELECTION,
  CUSTOM_EVENT_SELECTION,
  Selection,
} from "@/types/custom-event";

function useSelection() {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [sdoWaiting, setSDOWaiting] = useState<boolean>(false);

  useEffect(() => {
    const handleSelection = (e: CustomEvent<Selection>) => {
      console.log("?");
      setSDOWaiting(false);
      setSelection(e.detail);
    };

    const handleSDOSelection = (e: CustomEvent) => {
      setSelection(null);
      setSDOWaiting(true);
    };

    window.addEventListener(
      CUSTOM_EVENT_SELECTION,
      handleSelection as EventListener,
    );
    window.addEventListener(
      CUSTOM_EVENT_SDO_SELECTION,
      handleSDOSelection as EventListener,
    );
    return () => {
      window.removeEventListener(
        CUSTOM_EVENT_SELECTION,
        handleSelection as EventListener,
      );
      window.removeEventListener(
        CUSTOM_EVENT_SDO_SELECTION,
        handleSDOSelection as EventListener,
      );
    };
  }, []);

  return { selection, sdoWaiting };
}

export default useSelection;
