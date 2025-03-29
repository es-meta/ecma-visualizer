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
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);

  // not found flag를 둬야겠네

  async function fetchProgram() {
    setLoading(true);
    setError(false);
    try {
      if (!selection) return;
      const nodeIds = await fetchStepToNodeId(selection.secId, selection.step);

      if (callstack.isEmpty()) {
        const progs = await fetchNodeIdToScript(nodeIds[0]);
        const shortestProg = progs.reduce((shortest, current) =>
          current.length < shortest.length ? current : shortest,
        );
        setCode(shortestProg);
      } else {
        const currentCp = await callstack.toFuncId();
        const featureToProgIDArr = await Promise.all(
          nodeIds.map((nid) => fetchFNCByNodeId(nid)),
        );
        const cpMap: Record<string, number[]>[] = featureToProgIDArr.flatMap(
          (featureToProgId) => Object.values(featureToProgId),
        );

        console.log(cpMap);
        console.log(currentCp);

        let progId: number | null = null;
        cpMap.some((cp) => {
          const foundCP = Object.keys(cp).find((c) => c.endsWith(currentCp));

          if (foundCP) {
            progId = cp[foundCP][0];
            return true;
          }
        });

        if (progId) {
          setCode(await fetchScriptByProgId(progId));
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

  return { code, setCode, loading, error, notFound };
}

export default useProgram;
