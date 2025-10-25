"use client";

import { useLocalStorage } from "@aglaya/hooks/useLocalStorage";
import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

import { authLogger } from "@/lib/logger";

interface AuthContextType {
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ isAuthenticated, setIsAuthenticated ] = useState<boolean>(false);
  const [ authToken, setAuthToken ] = useLocalStorage<string | null>("authToken", null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // In a real app, you would verify the token with your backend here
    const isValid = !!authToken; // Simplified check, replace with actual validation
    setIsAuthenticated(isValid);
    authLogger.debug("Auth check completed", { isValid });
    return isValid;
  };

  const login = async () => {
    authLogger.info("Login attempt started");
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setAuthToken("dummy_token");
    setIsAuthenticated(true);
    authLogger.info("Login successful");
  };

  const logout = () => {
    authLogger.info("Logout initiated");
    setAuthToken(null);
    setIsAuthenticated(false);
    authLogger.info("Logout completed");
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
