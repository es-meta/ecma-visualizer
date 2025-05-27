import { useStore } from "jotai";
import { createMessageListener } from "./listener";

/**
 * register atom setters to browser.runtime using useEffect
 */
export function AtomSynchronizer() {
  const store = useStore();

  useEffect(() => {
    const messageListener = createMessageListener(store);
    browser.runtime.onMessage.addListener(messageListener);
    return () => {
      browser.runtime.onMessage.removeListener(messageListener);
    };
  }, [store]);

  return null;
}
