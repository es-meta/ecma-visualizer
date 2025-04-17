import { store } from "./store";
import { messagesAtom, messageCountAtom } from './defs';

/**
 * 
 * @returns true
 */
function messageEventListner(message : unknown, sender : Browser.runtime.MessageSender, sendResponse: (response?: unknown) => void): true {
  // 메시지가 사이드 패널용인지 확인
  // if (message.target === 'sidePanel') {
    // Jotai 스토어를 사용하여 값 업데이트
    const currentCount = getCount();
    setCount(currentCount + 1);
    
    // 메시지 내용도 저장하고 싶다면 (선택적)
    const currentMessages = getMessages();
    setMessages([...currentMessages, message]);
    
    // 응답이 필요하다면
    sendResponse({ success: true });
  // }
  
  // 리스너를 유지하기 위해 true 반환 (비동기 응답을 위해)
  return true;
}

/**
 * register atom setters to browser.runtime using useEffect
 */
export function RegisterAtoms() {

  useEffect(() => {
    browser.runtime.onMessage.addListener(messageEventListner);
    return () => browser.runtime.onMessage.removeListener(messageEventListner);
  }, []);

  return null;
}


// 값을 가져오는 함수
const getCount = () => store.get(messageCountAtom);
const getMessages = () => store.get(messagesAtom);

// 값을 설정하는 함수
const setCount = (count: number) => store.set(messageCountAtom, count);
const setMessages = (messages: unknown[]) =>
  store.set(messagesAtom, messages);
