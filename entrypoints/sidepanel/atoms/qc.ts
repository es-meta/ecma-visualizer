import { QueryClient } from "@tanstack/query-core";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

export const getQueryClient = () => queryClient;
