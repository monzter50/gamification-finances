import { createBrowserRouter, Navigate, RouterProvider } from "react-router";

import { SessionBlockedGate } from "@/components/session/SessionBlockedGate";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext.tsx";
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
import Signin from "@/pages/onboarding/signin";
import { ProtectedRoutes } from "@/routes/protected/ProctectedRoutes.tsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Signin />,
  },
  {
    path: "/",
    // eslint-disable-next-line react/jsx-no-undef
    element: <ProtectedRoutes />,
    loader: () => null, // We'll handle auth check in the component
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: "transactions",
        element: <Transactions />
      },
      {
        path: "profile",
        element: <Profile />
      },
      {
        path: "budget",
        element: <Budget />
      },
      {
        path: "budget/:id",
        element: <BudgetDetail />
      },
      {
        path: "budget/:id/income",
        element: <BudgetIncome />
      },
      {
        path: "budget/:id/expense",
        element: <BudgetExpense />
      },
      {
        path: "budget/:id/transactions",
        element: <BudgetTransactions />
      },
      {
        path: "accounts",
        element: <Accounts />
      }
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  },
]);

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <RouterProvider router={router} />
        <SessionBlockedGate />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
