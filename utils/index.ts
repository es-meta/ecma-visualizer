export function run<T>(f: () => T): void {
  f();
}

export * from "./logger.utils";
