import { useState, useEffect } from "react";
import { Selection } from "@/types/message";

function useSelection() {
  const [selection, setSelection] = useState<Selection | null>(null);
  useEffect(() => {
    const handleChange = (e: CustomEvent<Selection>) => {
      setSelection(e.detail);
    };

    window.addEventListener("custom", handleChange as EventListener);
    return () => {
      window.removeEventListener("custom", handleChange as EventListener);
    };
  }, []);

  return { selection };
}

export default useSelection;
