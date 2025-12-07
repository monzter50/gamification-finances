import {  createBrowserRouter, Navigate, RouterProvider } from "react-router";

import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext.tsx";
import { ThemeProvider } from "@/context/ThemeContext.tsx";
import Budget from "@/pages/main/budget";
import BudgetDetail from "@/pages/main/budget/detail";
import BudgetExpense from "@/pages/main/budget/expense";
import BudgetIncome from "@/pages/main/budget/income";
import Dashboard from "@/pages/main/dashboard";
import Expenses from "@/pages/main/expenses";
import Goals from "@/pages/main/goals";
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
      { index: true,
        element: <Dashboard /> },
      { path: "goals",
        element: <Goals /> },
      { path: "transactions",
        element: <Transactions /> },
      { path: "profile",
        element: <Profile /> },
      { path:"expenses",
        element:<Expenses/> },
      { path:"budget",
        element:<Budget/> },
      { path:"budget/:id",
        element:<BudgetDetail/> },
      { path:"budget/:id/income",
        element:<BudgetIncome/> },
      { path:"budget/:id/expense",
        element:<BudgetExpense/> }
    ],
  },
  { path: "*",
    element: <Navigate to="/" replace /> },
]);

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
