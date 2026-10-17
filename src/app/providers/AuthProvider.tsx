import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";

import { authLogger } from "@/config/logger";
import { isSessionAlreadyActive, type SessionBlockReason } from "@/config/session";
import { resetSessionRevoked, subscribeSessionRevoked } from "@/config/session-revocation";
import {
  clearSession,
  hasValidSession,
  loginRequest,
  logoutRequest,
  saveSession,
  sessionUserQuery,
} from "@/features/auth";
import { normalizeError } from "@/shared/errors";

/**
 * SESSION state only — is someone signed in, is a blocking screen up, and the
 * actions that change that. The user's data is server state: read it with
 * `useSessionUser()` from `@/features/auth`.
 */
interface AuthContextValue {
  isAuthenticated: boolean;
  /** True while a stored token is being verified (first load / after login). */
  isCheckingSession: boolean;
  // eslint-disable-next-line no-unused-vars
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /**
   * Single active session: "revoked" (token superseded mid-session) or
   * "already_active" (login rejected because a session is active elsewhere).
   */
  sessionBlock: SessionBlockReason | null;
  dismissSessionBlock: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const qc = useQueryClient();
  const [hasSession, setHasSession] = useState(hasValidSession);
  const [sessionBlock, setSessionBlock] = useState<SessionBlockReason | null>(null);

  // Verifies the stored token with the backend (and loads the user for everyone).
  const me = useQuery({ ...sessionUserQuery(), enabled: hasSession });

  const endSession = useCallback(() => {
    clearSession();
    setHasSession(false);
    // No cached server data may outlive the session (the next user must not see it).
    qc.clear();
  }, [qc]);

  // Only a token the backend REJECTS ends the session. Offline or a 5xx must
  // not log anyone out (the old provider did, on any /auth/me failure).
  const tokenRejected =
    hasSession && me.isError && normalizeError(me.error).kind === "unauthorized";
  useEffect(() => {
    if (!tokenRejected) return;
    authLogger.warn("Stored token rejected by the backend");
    endSession();
  }, [tokenRejected, endSession]);

  // Mid-session revocation, detected by the API mutator (440). Local cleanup
  // only — a logout request would 440 again and loop.
  useEffect(
    () =>
      subscribeSessionRevoked(() => {
        authLogger.warn("Session revoked by a newer login");
        clearSession();
        setHasSession(false);
        setSessionBlock("revoked");
      }),
    [],
  );

  const login = async (email: string, password: string) => {
    try {
      const { token, expiresIn } = await loginRequest({ email, password });
      saveSession(token, expiresIn);
      // Load the user before flipping the session, so protected routes never
      // render without one.
      await qc.fetchQuery(sessionUserQuery());
      setHasSession(true);
    } catch (error) {
      clearSession();
      if (isSessionAlreadyActive(error)) {
        authLogger.warn("Login blocked: session already active");
        setSessionBlock("already_active");
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      // Never strand the user signed in because the server hiccuped.
      authLogger.warn("Logout request failed; clearing the local session anyway", error);
    } finally {
      endSession();
    }
  };

  const dismissSessionBlock = () => {
    resetSessionRevoked();
    setSessionBlock(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: hasSession,
        isCheckingSession: hasSession && me.isPending,
        login,
        logout,
        sessionBlock,
        dismissSessionBlock,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
