import type {
  DefaultError,
  QueryFunction,
  QueryFunctionContext,
  QueryKey,
  SkipToken,
} from "@tanstack/query-core";
import { atom, WritableAtom } from "jotai";
import {
  atomWithSuspenseQuery,
  AtomWithSuspenseQueryResult,
} from "jotai-tanstack-query";

type MaybePromise<T> = T | Promise<T>;
type Wrap<T, E> =
  | {
      type: "data_wrapped";
      data: T;
    }
  | {
      type: "error_wrapped";
      error: E;
    };

function catchAsWrapped<
  T = unknown,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = never,
>(
  fn: QueryFunction<T, TQueryKey, TPageParam>,
): (
  context: QueryFunctionContext<TQueryKey, TPageParam>,
) => Promise<Wrap<T, unknown>> {
  return async function (context: QueryFunctionContext<TQueryKey, TPageParam>) {
    try {
      return {
        type: "data_wrapped",
        data: await fn(context),
      };
    } catch (e) {
      return {
        type: "error_wrapped",
        error: e,
      };
    }
  };
}

export function atomWithSuspenseQueryFixed<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  getOptions: Parameters<
    typeof atomWithSuspenseQuery<
      TQueryFnData,
      TError,
      Wrap<TData, unknown>,
      TQueryKey
    >
  >[0],
  getQueryClient: Parameters<
    typeof atomWithSuspenseQuery<
      TQueryFnData,
      TError,
      Wrap<TData, unknown>,
      TQueryKey
    >
  >[1],
): WritableAtom<
  MaybePromise<
    Pick<Awaited<AtomWithSuspenseQueryResult<TData, unknown>>, "data" | "error">
  >,
  [],
  void
> {
  const fixedGetOptions = (...args: Parameters<typeof getOptions>) => {
    const old = getOptions(...args);
    const queryFn = old.queryFn;

    type QueryFn =
      | SkipToken
      | QueryFunction<TQueryFnData, TQueryKey, never>
      | undefined;

    return {
      ...old,
      queryFn: (typeof queryFn === "object"
        ? catchAsWrapped(queryFn)
        : queryFn) as QueryFn,
    };
  };

  const atomWithSuspense = atomWithSuspenseQuery<
    TQueryFnData,
    TError,
    Wrap<TData, unknown>,
    TQueryKey
  >(fixedGetOptions, getQueryClient);

  const atomMimic = atom(
    async (get) => {
      const { data } = await get(atomWithSuspense);
      if (data.type === "data_wrapped") {
        return {
          data: data.data,
          error: null,
        };
      } else {
        throw data.error;
      }
    },
    (get, set) => {},
  );

  return atomMimic;
}
