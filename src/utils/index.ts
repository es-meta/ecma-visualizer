export function fire<T>(f: () => Promise<T>): void {
  f();
}

export * as concurrency from "./concurrency.utils";
export * as logger from "./logger.utils";
export * as str from "./str.utils";
export * as url from "./url.utils";
