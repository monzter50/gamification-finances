"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ isAuthenticated, setIsAuthenticated ] = useState<boolean>(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // In a real app, you would verify the token with your backend here
    const token = localStorage.getItem("authToken");
    const isValid = !!token; // Simplified check, replace with actual validation
    setIsAuthenticated(isValid);
    return isValid;
  };

  const login = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    localStorage.setItem("authToken", "dummy_token");
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
  };

  return <AuthContext.Provider value={{ isAuthenticated,
    login,
    logout,
    checkAuth
  }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
