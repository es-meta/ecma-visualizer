export function fire<T>(f: () => Promise<T>): void {
  f();
}

export * as logger from "./logger.utils";
export * from "./support.utils";
