import { CallStack } from "@/types/call-stack";
import { Selection } from "@/types/custom-event";
import { useState, useEffect } from "react";
import { fetchNodeIdToScript, fetchStepToNodeId } from "../../util/api";

function useProgram(selection: Selection | null, callstack: CallStack) {
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  async function fetchDefaultProgram() {
    setLoading(true);
    setError(false);
    try {
      if (!selection) return;
      const nodeIds = await fetchStepToNodeId(selection.secId, selection.step);
      const progs = await fetchNodeIdToScript(nodeIds[0]);
      const shortestProg = progs.reduce((shortest, current) =>
        current.length < shortest.length ? current : shortest,
      );
      setCode(shortestProg);
    } catch (e) {
      setError(true);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (callstack.isEmpty()) fetchDefaultProgram();
  }, [selection]);

  return { code, setCode, loading, error };
}

export default useProgram;
