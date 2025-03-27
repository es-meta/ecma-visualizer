import {
  ALERT_CALLSTACK_UPDATE_KEY,
  CallStack,
  ConvertedNode,
  getCallStackFromStorage,
} from "@/types/call-stack";
import { useEffect, useState } from "react";

function useCallStack() {
  const [callStack, setCallStack] = useState<CallStack>(new CallStack(null));
  const [convertedCallStack, setConvertedCallStack] = useState<ConvertedNode[]>(
    [],
  );

  async function updateCallStack() {
    const cs = getCallStackFromStorage();
    setCallStack(cs);
    setConvertedCallStack(await cs.convert());
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

  return { callStack, convertedCallStack };
}

export default useCallStack;
