import {
  ALERT_CALLSTACK_UPDATE_KEY,
  CallStack,
  getCallStackFromStorage,
} from "@/types/call-stack";
import { useEffect, useState } from "react";

function useCallStack() {
  const [callStack, setCallStack] = useState<CallStack>(new CallStack(null));

  function updateCallStack() {
    setCallStack(getCallStackFromStorage());
  }

  useEffect(() => {
    updateCallStack();

    const handleChange = (e: CustomEvent) => {
      updateCallStack();
    };

    window.addEventListener(
      ALERT_CALLSTACK_UPDATE_KEY,
      handleChange as EventListener,
    );
    return () => {
      window.removeEventListener(
        ALERT_CALLSTACK_UPDATE_KEY,
        handleChange as EventListener,
      );
    };
  }, []);

  return { callStack };
}

export default useCallStack;
