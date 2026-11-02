import { appLogger } from "@/config/logger";
import type { AppError } from "@/shared/errors/AppError";
import { normalizeError } from "@/shared/errors/normalize";

export interface ErrorContext {
  /** Where it happened: "budget.addIncomeItem", "RouteErrorPage", … */
  source?: string;
  [key: string]: unknown;
}

// eslint-disable-next-line no-unused-vars -- param names in a function type
type Reporter = (error: AppError, context: ErrorContext) => void;

const errorLogger = appLogger.child("Error");

/**
 * Default sink: the app logger. Swap in Sentry/Datadog with `setErrorReporter`
 * at startup — nothing else changes.
 */
let reporter: Reporter = (error, context) => {
  const payload = {
    kind: error.kind,
    code: error.code,
    status: error.status,
    ...context,
    cause: error.cause,
  };
  if (error.isUnexpected) {
    errorLogger.error(error.message, payload);
  } else {
    errorLogger.warn(error.message, payload);
  }
};

export const setErrorReporter = (next: Reporter): void => {
  reporter = next;
};

/**
 * Record an error for diagnostics. Returns the normalized error so it can be
 * used inline: `throw reportError(err, { source: "xlsx.confirm" })`.
 *
 * Never throws — a broken reporter must not take the app down with it.
 */
export const reportError = (error: unknown, context: ErrorContext = {}): AppError => {
  const appError = normalizeError(error);
  try {
    reporter(appError, context);
  } catch {
    // swallow: reporting is best-effort
  }
  return appError;
};

let installed = false;

/**
 * Catch what nothing else catches: uncaught exceptions outside React and
 * unhandled promise rejections. Call once from main.tsx. Idempotent.
 */
export const installGlobalErrorHandlers = (): void => {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    reportError(event.error ?? event.message, { source: "window.onerror" });
  });
  window.addEventListener("unhandledrejection", (event) => {
    reportError(event.reason, { source: "unhandledrejection" });
  });
};
