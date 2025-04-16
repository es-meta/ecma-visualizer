import { useState, useEffect } from "react";
import { CallStack } from "@/entrypoints/types/call-stack";
import { Selection } from "@/entrypoints/types/custom-event";
import { CustomError } from "./useProgram";
import {
  fetchAllTest262ByNodeId,
  fetchStepToNodeId,
  fetchTest262FNCByNodeId,
  fetchTest262NameByTest262Id,
} from "../../util/api";
import { Storage } from "./useStorage";
import { convertToIndex, getBitString } from "@/entrypoints/sidepanel/util/decode";

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
        setTest262(
          await fetchAllTest262ByNodeId(nodeIds[0], storage.test262IdToTest262),
        );
      } else {
        const currentCp = await callstack.toFuncId();
        const featureToTest262IDArr = await Promise.all(
          nodeIds.map((nid) => fetchTest262FNCByNodeId(nid)),
        );
        const cpMap = featureToTest262IDArr.flatMap((featureToProgId) =>
          Object.values(featureToProgId),
        );

        let test262Encode: String | null = null;
        cpMap.some((cp) => {
          const foundCP = Object.keys(cp).find((c) => c.startsWith(currentCp));

          if (foundCP) {
            test262Encode = cp[foundCP];
            return true;
          }
        });

        if (test262Encode) {
          const bitString = getBitString(test262Encode);
          setTest262(
            await Promise.all(
              convertToIndex(bitString).map((testId) =>
                fetchTest262NameByTest262Id(testId, storage.test262IdToTest262),
              ),
            ),
          );
        } else {
          setError("NotFound");
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
    if (!programLoading) fetchTest262s();
  }, [programLoading]);

  return {
    test262,
    loading,
    error,
  };
}

export default useTest262;
