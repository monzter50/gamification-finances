import { Navigate, Outlet } from "react-router";

import { useAuth } from "@/context/AuthContext";

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
