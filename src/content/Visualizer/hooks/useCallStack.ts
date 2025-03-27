import {
  CallStack,
  ConvertedNode,
  getCallStackFromStorage,
} from "@/types/call-stack";
import { CUSTOM_EVENT_CALLSTACK_UPDATE } from "@/types/custom-event";
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
      CUSTOM_EVENT_CALLSTACK_UPDATE,
      handleChange as EventListener,
    );
    return () => {
      window.removeEventListener(
        CUSTOM_EVENT_CALLSTACK_UPDATE,
        handleChange as EventListener,
      );
    };
  }, []);

  return { callStack, convertedCallStack };
}

export default useCallStack;
