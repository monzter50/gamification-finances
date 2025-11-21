"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

import { authService } from "@/services";
import type { UserProfile } from "@/types/api";

interface AuthContextType {
    isAuthenticated: boolean
    user: UserProfile | null
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    checkAuth: () => Promise<void>
    loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ isAuthenticated, setIsAuthenticated ] = useState<boolean>(false);
  const [ user, setUser ] = useState<UserProfile | null>(null);
  const [ loading, setLoading ] = useState<boolean>(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<void> => {
    try {
      setLoading(true);

      // Check if token exists
      if (!authService.isAuthenticated()) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      // Verify token with backend
      const response = await authService.getMe();

      if (response.status === "ok" && response.response) {
        setIsAuthenticated(true);
        setUser(response.response);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await authService.login({ email,
        password });

      if (response.status === "ok") {
        // Get user profile after successful login
        await checkAuth();
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local state even if API call fails
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return <AuthContext.Provider value={{
    isAuthenticated,
    user,
    login,
    logout,
    checkAuth,
    loading
  }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
