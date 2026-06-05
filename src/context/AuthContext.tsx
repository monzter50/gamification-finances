"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

import { clearAuthData, setAuthExpiry, setAuthToken } from "@/config/api-client";
import { authLogger } from "@/config/logger";
import { isSessionAlreadyActive, type SessionBlockReason } from "@/config/session";
import { resetSessionRevoked, subscribeSessionRevoked } from "@/config/session-revocation";
import { authService } from "@/services";
import { accountService } from "@/services/account.service";
import type { UserProfile, Account } from "@/types/api";

interface AuthContextType {
  isAuthenticated: boolean
  user: UserProfile | null
  accounts: Account[]
  // eslint-disable-next-line no-unused-vars
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => boolean
  fetchUserProfile: () => Promise<void>
  /**
   * Refresh the account list from the server. Call this after any operation
   * that can change an Account.balance — transactions, direct edits, deletes.
   * Per frontend-integration-guide.md §9, any transaction mutation changes
   * `Account.balance` and must invalidate the accounts list.
   */
  refreshAccounts: () => Promise<void>
  // eslint-disable-next-line no-unused-vars
  setAccounts: (accounts: Account[]) => void
  loading: boolean
  /**
   * Single-active-session: non-null when a blocking screen must be shown —
   * "revoked" (token superseded mid-session) or "already_active" (login
   * rejected because a session is already active elsewhere).
   */
  sessionBlock: SessionBlockReason | null
  dismissSessionBlock: () => void
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ isAuthenticated, setIsAuthenticated ] = useState<boolean>(false);
  const [ user, setUser ] = useState<UserProfile | null>(null);
  const [ accounts, setAccounts ] = useState<Account[]>([]);
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ sessionBlock, setSessionBlock ] = useState<SessionBlockReason | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const isAuth = checkAuth();
      if (isAuth && isMounted) {
        await fetchUserProfile();
        await fetchAccounts();
      } else if (isMounted) {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // React to a mid-session revocation detected in the API mutator. Clears local
  // auth state ONLY (no network call — that would 401 again and loop) and shows
  // the blocking screen.
  useEffect(() => {
    const unsubscribe = subscribeSessionRevoked(() => {
      authLogger.warn("Session revoked by a newer login");
      setIsAuthenticated(false);
      setUser(null);
      setAccounts([]);
      clearAuthData();
      setSessionBlock("revoked");
    });
    return unsubscribe;
  }, []);

  const dismissSessionBlock = (): void => {
    resetSessionRevoked();
    setSessionBlock(null);
  };

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

  const fetchAccounts = async (): Promise<void> => {
    try {
      const response = await accountService.getAll();
      if (response.success) {
        setAccounts(response.data ?? []);
      }
    } catch (error) {
      authLogger.error("Failed to fetch accounts", error);
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
      // Get user profile and accounts after successful login
      await fetchUserProfile();
      await fetchAccounts();
    } catch (error) {
      // Single-active-session: a 409 means the account already has an active
      // session elsewhere — show the blocking screen. We still rethrow so the
      // caller's success path is skipped; the form recognizes this case and
      // stays silent (the overlay owns the UX).
      if (isSessionAlreadyActive(error)) {
        authLogger.warn("Login blocked: session already active");
        setSessionBlock("already_active");
      }
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
      setAccounts([]);
      clearAuthData();

      authLogger.info("Logout completed");
    } catch (error) {
      authLogger.error("Logout error", error);
      // Still clear local state even if API call fails
      setIsAuthenticated(false);
      setUser(null);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  return <AuthContext.Provider value={{
    isAuthenticated,
    user,
    accounts,
    login,
    logout,
    checkAuth,
    fetchUserProfile,
    refreshAccounts: fetchAccounts,
    setAccounts,
    loading,
    sessionBlock,
    dismissSessionBlock
  }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
