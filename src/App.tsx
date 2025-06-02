import {  createBrowserRouter, Navigate, RouterProvider } from "react-router";

import { AuthProvider } from "@/context/AuthContext.tsx";
import { GamificationProvider } from "@/context/GamificationContext.tsx";
import { ThemeProvider } from "@/context/ThemeContext.tsx";
import Dashboard from "@/pages/main/dashboard";
import Expenses from "@/pages/main/expenses";
import Goals from "@/pages/main/goals";
import Profile from "@/pages/main/profile";
import Transactions from "@/pages/main/transactions";
import Signin, { loginAction } from "@/pages/onboarding/signin";
import { ProtectedRoutes } from "@/routes/protected/ProctectedRoutes.tsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Signin />,
    action: loginAction,
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
        element:<Expenses/> }
    ],
  },
  { path: "*",
    element: <Navigate to="/" replace /> },
]);

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <GamificationProvider>
          <RouterProvider router={router} />
        </GamificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
