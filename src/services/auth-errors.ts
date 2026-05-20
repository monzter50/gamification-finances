/**
 * Maps HTTP status codes from the auth endpoints to user-facing
 * ApplicationErrors. Defaults cover the common cases (401, 429, 5xx);
 * each call site can override specific codes with intent-specific messages
 * (e.g. login's 401 = "Invalid email or password" vs. the generic
 * "Authentication required").
 */
import { ApplicationError } from "@/utils/errors";

interface OverrideEntry {
  message: string;
  code:    string;
}

interface MapAuthErrorOptions {
  /** Human-readable action label used for the fallback message ("Login failed", "Registration failed", …). */
  intent:     string;
  /** Per-status overrides — e.g. { 401: { message: "Invalid email…", code: "INVALID_CREDENTIALS" } }. */
  overrides?: Partial<Record<number, OverrideEntry>>;
}

export const mapAuthError = (
  statusCode: number | undefined,
  { intent, overrides = {} }: MapAuthErrorOptions,
): ApplicationError => {
  const override = statusCode != null ? overrides[statusCode] : undefined;
  if (override) {
    return new ApplicationError(override.message, override.code, statusCode);
  }

  if (statusCode === 401) {
    return new ApplicationError(
      "Authentication required. Please log in.",
      "UNAUTHORIZED",
      401,
    );
  }
  if (statusCode === 429) {
    return new ApplicationError(
      "Too many requests. Please try again later.",
      "TOO_MANY_REQUESTS",
      429,
    );
  }
  if (statusCode != null && statusCode >= 500) {
    return new ApplicationError(
      "Server error. Please try again later.",
      "SERVER_ERROR",
      statusCode,
    );
  }
  return new ApplicationError(
    `${intent}. Please try again.`,
    "REQUEST_FAILED",
    statusCode ?? 400,
  );
};
