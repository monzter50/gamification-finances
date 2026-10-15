import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { subscribeSessionRevoked } from "@/config/session-revocation";
import { normalizeError, notifyError, reportError } from "@/shared/errors";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      /** The component shows the error itself (form, inline) — no global toast. */
      silent?: boolean;
      /** Toast heading, e.g. "Couldn't save budget". Defaults to the error kind's title. */
      errorTitle?: string;
    };
  }
}

/** Retry only what retrying can fix (network, 5xx, 429) — never 4xx. */
const MAX_RETRIES = 2;
const shouldRetry = (failureCount: number, error: unknown): boolean =>
  failureCount < MAX_RETRIES && normalizeError(error).isRetryable;

/**
 * Factory so tests get an isolated client with the same retry / error routing.
 * The app uses the `queryClient` singleton below.
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false, // mutations aren't idempotent by default
      },
    },
    // Query failures render <ErrorPanel> in place — report only, no toast.
    queryCache: new QueryCache({
      onError: (error, query) => {
        reportError(error, { source: "query", queryKey: query.queryKey });
      },
    }),
    // Mutation failures are user actions — toast unless the component handles it.
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        const context = { source: "mutation", mutationKey: mutation.options.mutationKey };
        if (mutation.meta?.silent) {
          reportError(error, context);
          return;
        }
        notifyError(error, { title: mutation.meta?.errorTitle, context });
      },
    }),
  });

export const queryClient = createQueryClient();

// No cached data may survive a revoked session (another user could sign in next).
subscribeSessionRevoked(() => queryClient.clear());
