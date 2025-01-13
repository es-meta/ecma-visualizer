import { useEffect, useState } from "react";

function useCallStack() {
  const [callStack, setCallStack] = useState<number[]>([]);
  const key = "CALLSTACK";

  function getCallStack() {
    const existingData = sessionStorage.getItem(key);
    return existingData ? JSON.parse(existingData) : [];
  }

  function updateCallStack() {
    const stack = getCallStack();
    setCallStack(stack);
  }

  function saveCallStack() {
    sessionStorage.setItem(key, JSON.stringify(callStack));
  }

  function popStack() {
    deleteStack(0);
  }

  function flushStack() {
    setCallStack([]);
  }

  function deleteStack(idx: number) {
    setCallStack((prev) => prev.filter((_, index) => index !== idx));
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
