export function run<T>(f: () => T): void {
  f();
}

export function thrower<T>(e: T): () => never {
  return () => {
    throw e;
  };
}

export * from "./logger.utils";
export * from "./support.utils";
