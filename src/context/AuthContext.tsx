"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

import { clearAuthData, setAuthExpiry, setAuthToken } from "@/config/api-client";
import { authLogger } from "@/config/logger";
import { authService } from "@/services";
import type { UserProfile } from "@/types/api";

interface AuthContextType {
  isAuthenticated: boolean
  user: UserProfile | null
  // eslint-disable-next-line no-unused-vars
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => boolean
  fetchUserProfile: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ isAuthenticated, setIsAuthenticated ] = useState<boolean>(false);
  const [ user, setUser ] = useState<UserProfile | null>(null);
  const [ loading, setLoading ] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const isAuth = checkAuth();
      if (isAuth && isMounted) {
        await fetchUserProfile();
      } else if (isMounted) {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const checkAuth = (): boolean => {
    authLogger.debug("Checking authentication");

    // Check if token exists
    if (!authService.isAuthenticated()) {
      authLogger.debug("No token found");
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }

    authLogger.debug("Token found");
    setIsAuthenticated(true);
    return true;
  };

  const fetchUserProfile = async (): Promise<void> => {
    try {
      setLoading(true);
      authLogger.debug("Fetching user profile");

      // Verify token with backend and get user data
      const response = await authService.getMe();

      authLogger.info("User profile fetched", { userId: response.id });
      setUser(response);

    } catch (error) {
      authLogger.error("Failed to fetch user profile", error);
      // If fetching profile fails, clear auth state
      setIsAuthenticated(false);
      setUser(null);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      authLogger.info("Login initiated", { email });

      const { token, expiresIn } = await authService.login({
        email,
        password
      });

      setAuthToken(token);
      // Convert expiresIn (seconds) to absolute timestamp (milliseconds)
      const expiryTimestamp = Date.now() + (expiresIn * 1000);
      setAuthExpiry(expiryTimestamp);
      setIsAuthenticated(true);

      authLogger.info("Login successful, fetching user profile");
      // Get user profile after successful login
      await fetchUserProfile();
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
      clearAuthData();

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
    fetchUserProfile,
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
