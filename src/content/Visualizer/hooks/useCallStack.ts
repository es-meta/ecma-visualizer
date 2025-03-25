import { useEffect, useState } from "react";

function useCallStack() {
  const [callStack, setCallStack] = useState<number[]>([]);
  const [ecId, setEcId] = useState<string[]>([]);
  const key = "CALLSTACK";
  const key2 = "ECID";

  function getCallStack() {
    const existingData = sessionStorage.getItem(key);
    const existingData2 = sessionStorage.getItem(key2);

    return [
      existingData ? JSON.parse(existingData) : [],
      existingData2 ? JSON.parse(existingData2) : [],
    ];
  }

  function updateCallStack() {
    const [stack, ecId] = getCallStack();
    setCallStack(stack);
    setEcId(ecId);
  }

  function saveCallStack() {
    sessionStorage.setItem(key, JSON.stringify(callStack));
    sessionStorage.setItem(key2, JSON.stringify(ecId));
  }

  function popStack() {
    deleteStack(0);
  }

  function flushStack() {
    setCallStack([]);
    setEcId([]);
  }

  function deleteStack(idx: number) {
    setCallStack((prev) => prev.filter((_, index) => index !== idx));
    setEcId((prev) => prev.filter((_, index) => index !== idx));
  }

  useEffect(() => {
    updateCallStack();

    const handleChange = (e: CustomEvent) => {
      updateCallStack();
    };

    window.addEventListener("callstack updated", handleChange as EventListener);
    return () => {
      window.removeEventListener(
        "callstack updated",
        handleChange as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    saveCallStack();
  }, [callStack]);

  return {
    callStack,
    popStack,
    flushStack,
  };
}

export default useCallStack;
