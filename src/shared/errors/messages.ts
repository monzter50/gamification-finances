import type { ErrorKind } from "@/shared/errors/AppError";
import type { KnownErrorCode } from "@/shared/errors/error-codes";
import { normalizeError } from "@/shared/errors/normalize";

/**
 * User-facing copy for errors — the ONLY place error text for users lives.
 *
 * TODO(i18n): no i18n library is installed yet. When one is, these maps become
 * translation keys (`errors.codes.BUDGET_NOT_FOUND`, `errors.kinds.network`)
 * and `toUserMessage` calls `t()`. Callers don't change.
 */
const CODE_MESSAGES: Partial<Record<KnownErrorCode, string>> = {
  INVALID_CREDENTIALS: "Invalid email or password.",
  INVALID_TOKEN: "Your session is no longer valid. Please sign in again.",
  TOKEN_BLACKLISTED: "You've been signed out. Please sign in again.",
  ACCOUNT_DEACTIVATED: "This account has been deactivated.",
  USER_ALREADY_EXISTS: "An account with this email already exists.",
  SESSION_ALREADY_ACTIVE: "This account is already signed in on another device.",
  SESSION_REVOKED: "You signed in on another device, so this session was closed.",
  TOO_MANY_ATTEMPTS: "Too many attempts. Wait a few minutes and try again.",
  RATE_LIMITED: "You're going a bit fast. Wait a moment and try again.",
  INVALID_MONTH: "Choose a valid month.",
  AMOUNT_OUT_OF_RANGE: "That amount is too large.",
  PAYLOAD_TOO_LARGE: "That's too much data to send at once.",
  BUDGET_NOT_FOUND: "This budget doesn't exist or was deleted.",
  BUDGET_ALREADY_EXISTS: "There's already a budget for that month.",
  INCOME_ITEM_NOT_FOUND: "This income item no longer exists.",
  EXPENSE_ITEM_NOT_FOUND: "This expense item no longer exists.",
  INCOME_LIMIT_EXCEEDED: "This would exceed the planned income for this item.",
  INVALID_BUDGET_ITEM: "Pick a valid budget item.",
  INVALID_BUDGET_ITEM_REFERENCE: "The selected budget item doesn't belong to this budget.",
  ACCOUNT_NOT_FOUND: "This account doesn't exist or was deleted.",
  ACCOUNT_HAS_TRANSACTIONS: "This account has transactions. Move or delete them first.",
  INVALID_ACCOUNT_REFERENCE: "One of the selected accounts no longer exists. Pick another account.",
  // STALE_ACCOUNT_REFERENCES has no copy on purpose: the backend message lists
  // the offending account ids, which is what the user needs to fix it.
  TRANSACTION_NOT_FOUND: "This transaction doesn't exist or was deleted.",
  UNSUPPORTED_TRANSACTION_TYPE: "That transaction type isn't supported.",
  NO_FILE_UPLOADED: "Choose a file to upload.",
  UNSUPPORTED_FILE_TYPE: "That file type isn't supported. Upload an .xlsx file.",
  FILE_TOO_LARGE: "That file is too large.",
  NO_TRANSACTIONS_FOUND: "We couldn't find any transactions in that file.",
  UNMAPPED_PAYMENT_SOURCE: "Map every payment source to an account before importing.",
  TIMEOUT: "The server took too long to respond. Try again.",
  ABORTED: "The request was cancelled.",
};

const KIND_MESSAGES: Record<ErrorKind, string> = {
  validation: "Some information isn't valid. Check it and try again.",
  unauthorized: "Please sign in to continue.",
  forbidden: "You don't have permission to do that.",
  not_found: "We couldn't find what you were looking for.",
  conflict: "This changed in the meantime. Refresh and try again.",
  rate_limited: "You're going a bit fast. Wait a moment and try again.",
  session: "Your session ended. Please sign in again.",
  network: "Can't reach the server. Check your connection and try again.",
  server: "Something went wrong on our side. Try again in a moment.",
  client: "Something went wrong. Try again, or reload the page.",
  unknown: "Something went wrong. Try again.",
};

const KIND_TITLES: Record<ErrorKind, string> = {
  validation: "Check your input",
  unauthorized: "Sign in required",
  forbidden: "Not allowed",
  not_found: "Not found",
  conflict: "Out of date",
  rate_limited: "Slow down",
  session: "Session ended",
  network: "You're offline",
  server: "Server error",
  client: "Unexpected error",
  unknown: "Something went wrong",
};

/** Kinds where the backend's own message is written for users and safe to show. */
const BACKEND_MESSAGE_KINDS: ReadonlySet<ErrorKind> = new Set([
  "validation",
  "conflict",
  "not_found",
  "forbidden",
]);

/**
 * The text to show a user for any error. Priority:
 *   1. Our copy for a known `code`
 *   2. Backend field messages (validation) — they name what to fix
 *   3. Backend message, for 4xx kinds where it's user-oriented
 *   4. Generic copy for the error's kind
 * 5xx / client bugs never leak technical text.
 */
export const toUserMessage = (error: unknown): string => {
  const e = normalizeError(error);

  const byCode = CODE_MESSAGES[e.code as KnownErrorCode];
  if (byCode) return byCode;

  if (e.fieldErrors.length > 0) {
    return [...new Set(e.fieldErrors.map((f) => f.message))].join(". ");
  }

  if (
    BACKEND_MESSAGE_KINDS.has(e.kind) &&
    e.status != null &&
    !/^Request failed|^HTTP \d/.test(e.message)
  ) {
    return e.message;
  }

  return KIND_MESSAGES[e.kind];
};

/** Short heading for toasts / error panels. */
export const toUserTitle = (error: unknown): string => KIND_TITLES[normalizeError(error).kind];
