import { normalizeError, toUserMessage } from "@/shared/errors";

// TODO(i18n)
/**
 * Copy for a failed login. Branches on status/kind, never on message text.
 * (409 "session already active" is handled by the blocking screen, not here.)
 */
export const loginErrorMessage = (error: unknown): string => {
  const e = normalizeError(error);
  if (e.status === 401) return "Invalid email or password. Please try again.";
  if (e.status === 403) return "Account access is restricted.";
  if (e.kind === "rate_limited") return "Too many attempts. Please wait a moment and try again.";
  if (e.kind === "network") return "Network error. Please check your internet connection.";
  return toUserMessage(e);
};
