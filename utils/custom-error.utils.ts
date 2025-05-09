export const SDO_WAITING = "SDO_WAITING";
export const CALLSTACK_EMPTY = "CALLSTACK_EMPTY";
export const NOT_FOUND = "NOT_FOUND";
export const UNKNOWN = "UNKNOWN";

export class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomError";
  }
}

export function waitingSdoError() {
  return new CustomError(SDO_WAITING);
}

export function notFoundError() {
  return new CustomError(NOT_FOUND);
}

export function unknownError() {
  return new CustomError(UNKNOWN);
}

export function callStackEmptyError() {
  return new CustomError(CALLSTACK_EMPTY);
}
