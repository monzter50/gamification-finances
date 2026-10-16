"use client";

import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router";

import { useAuth } from "@/app/providers/AuthProvider";
import Layout from "@/layout";

export const ProtectedRoutes = () => {
  const { isAuthenticated, isCheckingSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect once a stored session has been verified (or there is none)
    if (!isCheckingSession && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isCheckingSession, navigate]);

  // Show loading state while checking authentication
  if (isCheckingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto" />
          <p className="mt-4 text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Only render protected content if authenticated
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};
