type LoggerTypeBasic = {
  info: (...data: unknown[]) => void;
  log: (...data: unknown[]) => void;
  error: (...data: unknown[]) => void;
  warn: (...data: unknown[]) => void;
};

const _loggerShow = Object.freeze({
  info: console.info,
  log: console.log,
  error: console.error,
  warn: console.warn,
});

export const logger: LoggerTypeBasic = _loggerShow;
