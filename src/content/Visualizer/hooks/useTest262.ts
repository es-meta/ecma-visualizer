import { useState, useEffect } from "react";
import { CallStack } from "@/types/call-stack";
import { Selection } from "@/types/custom-event";
import { CustomError } from "./useProgram.ts";
import { fetchAllTest262ByNodeId, fetchStepToNodeId } from "../../util/api";

function useTest262(
  selection: Selection | null,
  callstack: CallStack,
  programLoading: boolean,
) {
  const [test262, setTest262] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<CustomError | null>(null);

  async function fetchTest262s() {
    setLoading(true);
    setError(null);
    try {
      if (!selection) return;
      const nodeIds = await fetchStepToNodeId(selection.secId, selection.step);

      if (callstack.isEmpty()) {
        const testnames = await fetchAllTest262ByNodeId(nodeIds[0]);
        setTest262(testnames);
        console.log(testnames);
      } else {
      }
    } catch (e) {
      if (e instanceof Response && e.status === 404) {
        setError("NotFound");
      } else {
        console.error(e);
        setError("Error");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!programLoading) fetchTest262s();
  }, [programLoading]);

  return {
    test262,
    loading,
    error,
  };
}

export default useTest262;
