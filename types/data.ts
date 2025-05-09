export type SecIdToFuncId = Record<string, string>;
export type SecIdToFuncName = Record<string, string>;
export type Test262IdToTest262 = Record<string, string>;

export type Storage = {
  secIdToFuncId: SecIdToFuncId;
  secIdToFuncName: SecIdToFuncName;
  test262IdToTest262: Test262IdToTest262;
};

export type CustomError = "NotFound" | "Error";

export type Context = {
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

export type CallStack = Context[];
