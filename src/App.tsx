import { QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";

import { AuthProvider } from "@/app/providers/AuthProvider";
import { queryClient } from "@/app/query-client";
import { SessionBlockedGate } from "@/components/session/SessionBlockedGate";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/context/ThemeContext.tsx";
import Accounts from "@/pages/main/accounts";
import Budget from "@/pages/main/budget";
import BudgetDetail from "@/pages/main/budget/detail";
import BudgetExpense from "@/pages/main/budget/expense";
import BudgetIncome from "@/pages/main/budget/income";
import BudgetTransactions from "@/pages/main/budget/transactions";
import Dashboard from "@/pages/main/dashboard";
import Profile from "@/pages/main/profile";
import Transactions from "@/pages/main/transactions";
import XlsxImport from "@/pages/main/transactions/xlsx-import";
import Signin from "@/pages/onboarding/signin";
import { ProtectedRoutes } from "@/routes/protected/ProctectedRoutes.tsx";
import { RouteErrorPage } from "@/shared/errors";

// Dev-only, lazy so it never ships in the production bundle.
// eslint-disable-next-line turbo/no-undeclared-env-vars -- Vite built-in, not a turbo env var
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((m) => ({ default: m.ReactQueryDevtools })),
    )
  : () => null;

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Signin />,
    errorElement: <RouteErrorPage />,
  },
  {
    path: "/",
    // eslint-disable-next-line react/jsx-no-undef
    element: <ProtectedRoutes />,
    loader: () => null, // We'll handle auth check in the component
    errorElement: <RouteErrorPage />,
    children: [
      {
        // Pathless boundary: a crashing page renders RouteErrorPage inside the
        // layout, so the sidebar stays usable. The parent errorElement covers
        // crashes in the layout itself.
        errorElement: <RouteErrorPage />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "transactions",
            element: <Transactions />,
          },
          {
            path: "transactions/import-xlsx",
            element: <XlsxImport />,
          },
          {
            path: "profile",
            element: <Profile />,
          },
          {
            path: "budget",
            element: <Budget />,
          },
          {
            path: "budget/:id",
            element: <BudgetDetail />,
          },
          {
            path: "budget/:id/income",
            element: <BudgetIncome />,
          },
          {
            path: "budget/:id/expense",
            element: <BudgetExpense />,
          },
          {
            path: "budget/:id/transactions",
            element: <BudgetTransactions />,
          },
          {
            path: "accounts",
            element: <Accounts />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return (
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
}

export default App;
