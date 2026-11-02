/**
 * Error codes the app knows about.
 *
 * BACKEND codes mirror `errorCode` values sent by api-gamification-finances
 * (src/errors/*.ts, middleware/errorHandler.ts, middleware/validate.ts).
 * When the backend adds a code, add it here AND a message in `messages.ts`.
 * Unknown codes still work — they fall back to the backend message / kind.
 *
 * CLIENT codes are produced by the frontend itself (no server response).
 */
export const BACKEND_ERROR_CODES = [
  // auth / session
  "UNAUTHORIZED",
  "INVALID_CREDENTIALS",
  "INVALID_TOKEN",
  "TOKEN_BLACKLISTED",
  "ACCOUNT_DEACTIVATED",
  "USER_ALREADY_EXISTS",
  "USER_NOT_FOUND",
  "SESSION_ALREADY_ACTIVE",
  "SESSION_REVOKED",
  "TOO_MANY_ATTEMPTS",
  "RATE_LIMITED",
  // validation / request
  "VALIDATION_ERROR",
  "BAD_REQUEST",
  "INVALID_QUERY",
  "INVALID_MONTH",
  "AMOUNT_OUT_OF_RANGE",
  "PAYLOAD_TOO_LARGE",
  "ROUTE_NOT_FOUND",
  // budgets
  "BUDGET_NOT_FOUND",
  "BUDGET_ALREADY_EXISTS",
  "INCOME_ITEM_NOT_FOUND",
  "EXPENSE_ITEM_NOT_FOUND",
  "INCOME_LIMIT_EXCEEDED",
  "INVALID_BUDGET_ITEM",
  "INVALID_BUDGET_ITEM_REFERENCE",
  // accounts / transactions
  "ACCOUNT_NOT_FOUND",
  "ACCOUNT_HAS_TRANSACTIONS",
  "INVALID_ACCOUNT_REFERENCE",
  "STALE_ACCOUNT_REFERENCES",
  "TRANSACTION_NOT_FOUND",
  "UNSUPPORTED_TRANSACTION_TYPE",
  // xlsx import
  "NO_FILE_UPLOADED",
  "UNSUPPORTED_FILE_TYPE",
  "FILE_TOO_LARGE",
  "NO_TRANSACTIONS_FOUND",
  "UNMAPPED_PAYMENT_SOURCE",
  // server
  "INTERNAL_ERROR",
] as const;

export const CLIENT_ERROR_CODES = [
  "NETWORK_ERROR",
  "TIMEOUT",
  "ABORTED",
  "CLIENT_ERROR",
  "UNKNOWN_ERROR",
  // generic per-kind fallbacks when the server sent no code
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
] as const;

export type KnownErrorCode =
  | (typeof BACKEND_ERROR_CODES)[number]
  | (typeof CLIENT_ERROR_CODES)[number];

/** Known codes autocomplete; any other backend string is still accepted. */
// `string & {}` keeps literal autocomplete while accepting any backend string.
export type ErrorCode = KnownErrorCode | (string & {});
