import { QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router";

import { createQueryClient } from "@/app/query-client";
import { Toaster } from "@/components/ui/toaster";

/**
 * Render with the real providers: an isolated QueryClient (same error routing
 * as the app, no retries), a router, and the Toaster so toasts are assertable.
 * Signs in by default so services find a token.
 */
export const renderWithProviders = (
  ui: ReactElement,
  { signedIn = true, ...options }: RenderOptions & { signedIn?: boolean } = {},
) => {
  if (signedIn) localStorage.setItem("authToken", "test-token");

  const queryClient = createQueryClient();
  queryClient.setDefaultOptions({
    ...queryClient.getDefaultOptions(),
    queries: { ...queryClient.getDefaultOptions().queries, retry: false },
  });

  const user = userEvent.setup();
  const result = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {ui}
        <Toaster />
      </MemoryRouter>
    </QueryClientProvider>,
    options,
  );
  return { ...result, user, queryClient };
};
