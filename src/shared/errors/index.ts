/**
 * Error management — public API. Import from "@/shared/errors" only.
 *
 *   normalizeError(err)        any thrown value → AppError (kind, code, status, fieldErrors)
 *   toUserMessage(err)         user-facing copy (never leaks technical text)
 *   notifyError(err, opts)     report + toast — for failed user actions
 *   reportError(err, ctx)      report only — for things the user doesn't need to see
 *   applyFieldErrors(...)      backend validation → react-hook-form fields
 *   <ErrorPanel error onRetry> inline "failed to load" state
 *   RouteErrorPage             React Router errorElement
 */
export {
  AppError,
  isAppError,
  type AppErrorOptions,
  type ErrorKind,
  type FieldError,
} from "./AppError";
export {
  BACKEND_ERROR_CODES,
  CLIENT_ERROR_CODES,
  type ErrorCode,
  type KnownErrorCode,
} from "./error-codes";
export { errorFromResponse, normalizeError } from "./normalize";
export { toUserMessage, toUserTitle } from "./messages";
export {
  installGlobalErrorHandlers,
  reportError,
  setErrorReporter,
  type ErrorContext,
} from "./report";
export { notifyError, type NotifyErrorOptions } from "./notify";
export { applyFieldErrors, type ApplyFieldErrorsResult } from "./form";
export { ErrorPanel, type ErrorPanelProps } from "./components/ErrorPanel";
export { default as RouteErrorPage } from "./components/RouteErrorPage";
