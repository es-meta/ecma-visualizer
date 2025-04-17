import { useEffect, useState } from "react";
import { CustomError } from "./useProgram";

export type SecIdToFuncId = Record<string, string>;
export type SecIdToFuncName = Record<string, string>;
export type Test262IdToTest262 = Record<string, string>;

export type Storage = {
  secIdToFuncId: SecIdToFuncId;
  secIdToFuncName: SecIdToFuncName;
  test262IdToTest262: Test262IdToTest262;
};

function useStorage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<CustomError | null>(null);

  const [secIdToFuncId, setSecIdToFuncId] = useState<SecIdToFuncId>({});

  const [secIdToFuncName, setSecIdToFuncName] = useState<SecIdToFuncName>({});

  const [test262IdToTest262, setTest262IdToTest262] =
    useState<Test262IdToTest262>({});

  async function fetchFromStorage() {
    setLoading(loading);
    setError(error);

    try {
      const storage = await browser.storage.local.get();

      setSecIdToFuncId(storage["secIdToFuncId"]);
      setSecIdToFuncName(storage["secIdToFuncName"]);
      setTest262IdToTest262(storage["test262IdToTest262"]);
    } catch (e) {
      setError("Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFromStorage();
  }, []);

  return {
    storage: {
      secIdToFuncId,
      secIdToFuncName,
      test262IdToTest262,
    },
    loading,
    error,
  };
}

export default useStorage;
