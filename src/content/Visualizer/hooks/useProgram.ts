import { CallStack } from "@/types/call-stack";
import { Selection } from "@/types/custom-event";
import { useState, useEffect } from "react";
import {
  fetchFNCByNodeId,
  fetchNodeIdToScript,
  fetchScriptByProgId,
  fetchStepToNodeId,
} from "../../util/api";

function useProgram(selection: Selection | null, callstack: CallStack) {
  const [codeAndStepCnt, setCodeAndStepCnt] = useState<[string, number]>([
    "",
    0,
  ]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  // ToDo
  const [notFound, setNotFound] = useState<boolean>(false);

  async function fetchProgram() {
    setLoading(true);
    setError(false);
    try {
      if (!selection) return;
      const nodeIds = await fetchStepToNodeId(selection.secId, selection.step);

      if (callstack.isEmpty()) {
        const progs = await fetchNodeIdToScript(nodeIds[0]);
        const shortestProg = progs.reduce((shortest, current) =>
          current[0].length < shortest[0].length ? current : shortest,
        );
        setCodeAndStepCnt(shortestProg);
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
      setError(true);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProgram();
  }, [selection]);

  return { codeAndStepCnt, setCodeAndStepCnt, loading, error, notFound };
}

export default useProgram;
