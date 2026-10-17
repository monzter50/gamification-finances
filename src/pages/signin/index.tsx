import { Navigate } from "react-router";

import { useAuth } from "@/app/providers/AuthProvider";
import { SigninForm } from "@/features/auth";

const SigninPage = () => {
  const { isAuthenticated, login } = useAuth();
  // Signed in (already, or just now) → home.
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <SigninForm onLogin={login} />;
};

export default SigninPage;
