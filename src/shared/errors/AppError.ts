import type { ErrorCode } from "@/shared/errors/error-codes";

/**
 * What kind of failure this is — drives HOW the app reacts (toast, inline
 * field errors, redirect, retry button), independent of the exact code.
 */
export type ErrorKind =
  | "validation" //   400/422 — user can fix the input
  | "unauthorized" // 401 — not logged in / token invalid
  | "forbidden" //    403
  | "not_found" //    404
  | "conflict" //     409 — duplicate / state conflict
  | "rate_limited" // 429
  | "session" //      440 — superseded by a newer login (handled by SessionBlockedGate)
  | "network" //      request never reached the server / offline
  | "server" //       5xx
  | "client" //       bug in our code (render error, unexpected throw)
  | "unknown";

export interface FieldError {
  /** Request field the backend rejected (`amount`, `items[0].name`). */
  field?: string;
  message: string;
}

export interface AppErrorOptions {
  message: string;
  kind?: ErrorKind;
  code?: ErrorCode;
  status?: number;
  fieldErrors?: FieldError[];
  cause?: unknown;
}

/**
 * The single error type the app works with. Everything thrown — fetch
 * failures, backend envelopes, legacy `ApplicationError`, render crashes — is
 * turned into this by `normalizeError`, so UI code never inspects raw shapes.
 *
 * `message` is the technical/backend message (for logs). For user-facing copy
 * use `toUserMessage(error)`, which maps `code`/`kind` to the copy catalog.
 */
export class AppError extends Error {
  readonly kind: ErrorKind;
  readonly code: ErrorCode;
  readonly status?: number;
  readonly fieldErrors: FieldError[];
  /** Original thrown value (declared here: tsconfig lib predates ES2022 `Error.cause`). */
  readonly cause?: unknown;

  constructor({ message, kind, code, status, fieldErrors = [], cause }: AppErrorOptions) {
    super(message);
    this.cause = cause;
    this.name = "AppError";
    this.status = status;
    this.kind = kind ?? kindFromStatus(status);
    this.code = code ?? defaultCodeFor(this.kind);
    this.fieldErrors = fieldErrors;
  }

  /** Kept for code that still reads the legacy `statusCode` property. */
  get statusCode(): number | undefined {
    return this.status;
  }

  /** Safe to retry the same request automatically or via a "Try again" button. */
  get isRetryable(): boolean {
    return this.kind === "network" || this.kind === "server" || this.kind === "rate_limited";
  }

  /** Our bug or an unexpected server failure — worth reporting. Validation etc. is not. */
  get isUnexpected(): boolean {
    return this.kind === "server" || this.kind === "client" || this.kind === "unknown";
  }
}

export const isAppError = (value: unknown): value is AppError => value instanceof AppError;

export const kindFromStatus = (status?: number): ErrorKind => {
  if (status == null) return "unknown";
  if (status === 400 || status === 413 || status === 415 || status === 422) return "validation";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 429) return "rate_limited";
  if (status === 440) return "session";
  if (status >= 500) return "server";
  return "unknown";
};

const defaultCodeFor = (kind: ErrorKind): ErrorCode => {
  switch (kind) {
    case "network":
      return "NETWORK_ERROR";
    case "server":
      return "INTERNAL_ERROR";
    case "client":
      return "CLIENT_ERROR";
    case "validation":
      return "BAD_REQUEST";
    case "unauthorized":
      return "UNAUTHORIZED";
    case "forbidden":
      return "FORBIDDEN";
    case "not_found":
      return "NOT_FOUND";
    case "conflict":
      return "CONFLICT";
    case "rate_limited":
      return "RATE_LIMITED";
    case "session":
      return "SESSION_REVOKED";
    default:
      return "UNKNOWN_ERROR";
  }
};
