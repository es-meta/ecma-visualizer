import { customEventCallStackUpdate } from "./custom-event";

type Node = {
  callerId: string;
  step: string;
  calleeId: string;
};

export type FuncNameNode = {
  callerName: string;
  step: string;
};

export type FuncIdNode = {
  callerId: string;
  step: string;
};

export class CallStack {
  nodes: Node[] = [];

  constructor(jsonString: string | null) {
    if (jsonString) {
      const obj = JSON.parse(jsonString);
      this.nodes = obj.nodes;
    } else {
      this.nodes = [];
    }
  }

  push(node: Node) {
    /* [ToDo] : add recursive logics */
    if (this.peek()?.calleeId !== node.callerId) this.flush();

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
    return JSON.stringify(this);
  }

  size() {
    return this.nodes.length;
  }

  isEmpty(): boolean {
    return this.size() == 0;
  }

  async toFuncName(): Promise<FuncNameNode[]> {
    const nameMap = await chrome.storage.local.get();

    return this.nodes.reverse().map((n) => {
      return {
        callerName: nameMap["secIdToFuncName"][n.callerId],
        step: n.step,
      };
    });
  }

  async toFuncId(): Promise<string> {
    const nameMap = await chrome.storage.local.get();

    return this.nodes
      .map((n) => {
        return `${nameMap["secIdToFuncId"][n.callerId]}|${n.step}`;
      })
      .join("-");
  }
}

function saveAndAlert(cs: CallStack) {
  saveCallStackInStorage(cs);
  customEventCallStackUpdate();
}

export function getCallStackFromStorage() {
  return new CallStack(sessionStorage.getItem(STOARGE_CALLSTACK_KEY));
}

export function saveCallStackInStorage(cs: CallStack) {
  sessionStorage.setItem(STOARGE_CALLSTACK_KEY, cs.stringify());
}

export const STOARGE_CALLSTACK_KEY = "callstack";
