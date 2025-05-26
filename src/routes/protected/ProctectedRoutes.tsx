"use client";

import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router";

import { useAuth } from "@/context/AuthContext";
import Layout from "@/layout";

// Define the type for the Layout component

export const ProtectedRoutes = () => {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuth = await checkAuth();
      console.log("isAuth", isAuth);
      if (!isAuth) {
        navigate("/login");
      } else {
        navigate("/");
      }
    };
    verifyAuth();
  }, [ checkAuth, navigate ]);

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};
