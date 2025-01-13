import { useEffect, useState } from "react";

function useCallStack() {
  const [callStack, setCallStack] = useState<number[]>([]);
  const key = "CALLSTACK";

  function updateCallStack() {
    const existingData = sessionStorage.getItem(key);
    const dataArray = existingData ? JSON.parse(existingData) : [];
    setCallStack(dataArray);
  }

  function saveCallStack() {
    sessionStorage.setItem(key, JSON.stringify(callStack));
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
    deleteStack,
  };
}

export default useCallStack;
