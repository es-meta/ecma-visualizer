type Node = {
  callerId: string;
  step: string;
  calleeId: string;
};

export class CallStack {
  nodes: Node[];

  constructor(jsonString: string | null) {
    this.nodes = jsonString ? JSON.parse(jsonString) : [];
  }

  push(node: Node) {
    /* [ToDo] : add push logics */
    this.nodes.push(node);
    saveAndAlert(this);
  }

  pop(): Node | undefined {
    const poped = this.nodes.pop();
    saveAndAlert(this);
    return poped;
  }

  peek(): Node | undefined {
    return this.nodes[this.nodes.length - 1];
  }

  flush() {
    this.nodes = [];
    saveAndAlert(this);
  }

  stringify(): string {
    return JSON.stringify(this.nodes);
  }

  size() {
    return this.nodes.length;
  }
}

function saveAndAlert(cs: CallStack) {
  saveCallStackInStorage(cs);
  alertCallStackUpdate();
}

export function getCallStackFromStorage() {
  return new CallStack(sessionStorage.getItem(STOARGE_CALLSTACK_KEY));
}

export function saveCallStackInStorage(cs: CallStack) {
  sessionStorage.setItem(STOARGE_CALLSTACK_KEY, cs.stringify());
}

export function alertCallStackUpdate() {
  window.dispatchEvent(new CustomEvent(ALERT_CALLSTACK_UPDATE_KEY, {}));
}

export const ALERT_CALLSTACK_UPDATE_KEY = "callstack update";
export const STOARGE_CALLSTACK_KEY = "callstack";
