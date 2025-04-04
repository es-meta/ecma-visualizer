import { useState, useEffect } from "react";
import { CallStack } from "@/types/call-stack";
import { Selection } from "@/types/custom-event";
import { CustomError } from "./useProgram.ts";
import { fetchAllTest262ByNodeId, fetchStepToNodeId } from "../../util/api";
import { Storage } from "./useStorage.ts";

function useTest262(
  selection: Selection | null,
  callstack: CallStack,
  programLoading: boolean,
  storage: Storage,
) {
  const [test262, setTest262] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<CustomError | null>(null);

  async function fetchTest262s() {
    setLoading(true);
    setError(null);
    try {
      if (!selection) return;
      const nodeIds = await fetchStepToNodeId(
        selection.secId,
        selection.step,
        storage.secIdToFuncId,
      );

      if (callstack.isEmpty()) {
        const testnames = await fetchAllTest262ByNodeId(
          nodeIds[0],
          storage.test262IdToTest262,
        );
        setTest262(testnames);
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
