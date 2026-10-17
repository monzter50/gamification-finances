import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, type RouteObject } from "react-router";

import { PageFallback } from "@/app/routes/PageFallback";
import { ProtectedRoutes } from "@/app/routes/ProtectedRoutes";
import { RouteErrorPage } from "@/shared/errors";

// One chunk per page: a route's code downloads the first time it's visited.
const Signin = lazy(() => import("@/pages/signin"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Transactions = lazy(() => import("@/pages/transactions"));
const XlsxImport = lazy(() => import("@/pages/transactions/xlsx-import"));
const Profile = lazy(() => import("@/pages/profile"));
const Budget = lazy(() => import("@/pages/budget"));
const BudgetDetail = lazy(() => import("@/pages/budget/detail"));
const BudgetIncome = lazy(() => import("@/pages/budget/income"));
const BudgetExpense = lazy(() => import("@/pages/budget/expense"));
const BudgetTransactions = lazy(() => import("@/pages/budget/transactions"));
const Accounts = lazy(() => import("@/pages/accounts"));

/** The route table. Exported so tests can mount it in a memory router. */
export const routes: RouteObject[] = [
  {
    path: "/login",
    element: (
      <Suspense fallback={<PageFallback />}>
        <Signin />
      </Suspense>
    ),
    errorElement: <RouteErrorPage />,
  },
  {
    path: "/",
    // Session guard + layout. Pages suspend inside the layout, so the sidebar
    // stays put while a page chunk loads.
    element: <ProtectedRoutes />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        // Pathless boundary: a crashing page renders RouteErrorPage inside the
        // layout, so the sidebar stays usable. The parent errorElement covers
        // crashes in the layout itself.
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "transactions", element: <Transactions /> },
          { path: "transactions/import-xlsx", element: <XlsxImport /> },
          { path: "profile", element: <Profile /> },
          { path: "budget", element: <Budget /> },
          { path: "budget/:id", element: <BudgetDetail /> },
          { path: "budget/:id/income", element: <BudgetIncome /> },
          { path: "budget/:id/expense", element: <BudgetExpense /> },
          { path: "budget/:id/transactions", element: <BudgetTransactions /> },
          { path: "accounts", element: <Accounts /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
];

export const router = createBrowserRouter(routes);
