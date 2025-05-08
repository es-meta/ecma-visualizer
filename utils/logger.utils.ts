const USE_LOGGER = false;

type LogFunc = (...data: unknown[]) => void;

function empty() {}

export const info: LogFunc = USE_LOGGER ? console.info : empty;
export const log: LogFunc = USE_LOGGER ? console.log : empty;
export const error: LogFunc = USE_LOGGER ? console.error : empty;
export const warn: LogFunc = USE_LOGGER ? console.warn : empty;
export const group: LogFunc = USE_LOGGER ? console.group : empty;