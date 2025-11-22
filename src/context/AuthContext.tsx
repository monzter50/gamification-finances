"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

import { authLogger } from "@/config/logger";
import { authService } from "@/services";
import type { UserProfile } from "@/types/api";

interface AuthContextType {
    isAuthenticated: boolean
    user: UserProfile | null
    // eslint-disable-next-line no-unused-vars
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
      authLogger.debug("Checking authentication");

      // Check if token exists
      if (!authService.isAuthenticated()) {
        authLogger.debug("No token found");
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      // Verify token with backend
      const response = await authService.getMe();

      if (response.status === "ok" && response.response) {
        authLogger.info("Authentication verified", { userId: response.response.id });
        setIsAuthenticated(true);
        setUser(response.response);
      } else {
        authLogger.warn("Authentication verification failed");
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      authLogger.error("Auth check failed", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      authLogger.info("Login initiated", { email });

      const response = await authService.login({ email,
        password });

      if (response.status === "ok") {
        authLogger.info("Login successful, fetching user profile");
        // Get user profile after successful login
        await checkAuth();
      } else {
        authLogger.warn("Login failed", { status: response.status });
        throw new Error("Login failed");
      }
    } catch (error) {
      authLogger.error("Login error", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      authLogger.info("Logout initiated");

      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);

      authLogger.info("Logout completed");
    } catch (error) {
      authLogger.error("Logout error", error);
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
