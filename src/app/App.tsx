import { QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { RouterProvider } from "react-router";

import { AuthProvider } from "@/app/providers/AuthProvider";
import { queryClient } from "@/app/query-client";
import { router } from "@/app/router";
import { SessionBlockedGate } from "@/app/session/SessionBlockedGate";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/shared/theme";

// Dev-only, lazy so it never ships in the production bundle.
// eslint-disable-next-line turbo/no-undeclared-env-vars -- Vite built-in, not a turbo env var
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((m) => ({ default: m.ReactQueryDevtools })),
    )
  : () => null;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <RouterProvider router={router} />
        <SessionBlockedGate />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
    <Suspense fallback={null}>
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </Suspense>
  </QueryClientProvider>
);

export default App;
