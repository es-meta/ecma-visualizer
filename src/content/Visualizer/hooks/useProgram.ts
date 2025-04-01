import { CallStack } from "@/types/call-stack";
import { Selection } from "@/types/custom-event";
import { useState, useEffect } from "react";
import {
  fetchFNCByNodeId,
  fetchMinimalScriptByNodeId,
  fetchScriptByProgId,
  fetchStepToNodeId,
} from "../../util/api";

export type CustomError = "NotFound" | "Error";

function useProgram(selection: Selection | null, callstack: CallStack) {
  const [codeAndStepCnt, setCodeAndStepCnt] = useState<[string, number]>([
    "",
    0,
  ]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<CustomError | null>(null);

  async function fetchProgram() {
    setLoading(true);
    setError(null);
    try {
      if (!selection) return;
      const nodeIds = await fetchStepToNodeId(selection.secId, selection.step);

      if (callstack.isEmpty()) {
        setCodeAndStepCnt(await fetchMinimalScriptByNodeId(nodeIds[0]));
      } else {
        const currentCp = await callstack.toFuncId();
        const featureToProgIDArr = await Promise.all(
          nodeIds.map((nid) => fetchFNCByNodeId(nid)),
        );
        const cpMap = featureToProgIDArr.flatMap((featureToProgId) =>
          Object.values(featureToProgId),
        );

        let progId: [number, number] | null = null;
        cpMap.some((cp) => {
          const foundCP = Object.keys(cp).find((c) => c.endsWith(currentCp));

          if (foundCP) {
            progId = cp[foundCP];
            return true;
          }
        });

        if (progId) {
          setCodeAndStepCnt(await fetchScriptByProgId(progId[0], progId[1]));
        }
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
    fetchProgram();
  }, [selection]);

  return { codeAndStepCnt, setCodeAndStepCnt, loading, error };
}

export default useProgram;
