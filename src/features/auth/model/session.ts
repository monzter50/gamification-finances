import {
  getAuthExpiry,
  getAuthToken,
  removeAuthExpiry,
  removeAuthToken,
  setAuthExpiry,
  setAuthToken,
} from "@/config/api-client";

/*
 * The stored session (token + absolute expiry) — client state, not server
 * state. The token itself is attached to requests by the Orval mutator.
 */

/** True when a token is stored and hasn't expired. */
export const hasValidSession = (now = Date.now()): boolean => {
  const token = getAuthToken();
  const expiry = getAuthExpiry();
  return Boolean(token) && expiry !== null && now < expiry;
};

/** `expiresIn` is seconds from issue (backend contract); stored as an absolute ms timestamp. */
export const saveSession = (token: string, expiresIn: number, now = Date.now()): void => {
  setAuthToken(token);
  setAuthExpiry(now + expiresIn * 1000);
};

export const clearSession = (): void => {
  removeAuthToken();
  removeAuthExpiry();
  localStorage.removeItem("userData"); // legacy key, no longer written
};
