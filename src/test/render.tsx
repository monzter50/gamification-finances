import { QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { MemoryRouter, Route, Routes } from "react-router";

import { createQueryClient } from "@/app/query-client";
import { Toaster } from "@/components/ui/toaster";

interface RenderWithProvidersOptions extends RenderOptions {
  signedIn?: boolean;
  /**
   * Mount `ui` on a route so `useParams` works, e.g.
   * `{ path: "/budget/:id/expense", url: "/budget/b1/expense" }`.
   */
  route?: { path: string; url: string };
}

/**
 * Render with the real providers: an isolated QueryClient (same error routing
 * as the app, no retries), a router, and the Toaster so toasts are assertable.
 * Signs in by default so services find a token.
 */
export const renderWithProviders = (
  ui: ReactElement,
  { signedIn = true, route, ...options }: RenderWithProvidersOptions = {},
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
      <MemoryRouter initialEntries={route ? [route.url] : undefined}>
        {route ? (
          <Routes>
            <Route path={route.path} element={ui} />
          </Routes>
        ) : (
          ui
        )}
        <Toaster />
      </MemoryRouter>
    </QueryClientProvider>,
    options,
  );
  return { ...result, user, queryClient };
};
