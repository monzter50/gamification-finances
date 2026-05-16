"use client";

import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router";

import { useAuth } from "@/context/AuthContext";
import Layout from "@/layout";

export const ProtectedRoutes = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only check auth after loading is complete
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [ isAuthenticated, loading, navigate ]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
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
