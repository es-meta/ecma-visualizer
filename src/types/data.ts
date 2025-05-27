export type SecIdToFunc = Record<
  string,
  [number, string, number[]] | undefined
>;
export type Test262IdToTest262 = Record<string, string>;

export type Storage = {
  secIdToFunc: SecIdToFunc;
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
