import { AppError, kindFromStatus, type FieldError } from "@/shared/errors/AppError";

/**
 * Backend error envelope (api-gamification-finances middleware/errorHandler.ts):
 *
 *   { success: false, message, error, errorCode, errors?: [{ field, message }] }
 *
 * `error` duplicates `message` for older clients. Validation responses use
 * `errors[].message`; very old ones used `errors[].msg`.
 */
interface BackendErrorBody {
  message?: unknown;
  error?: unknown;
  errorCode?: unknown;
  errors?: unknown;
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

const nonEmptyString = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() !== "" ? v : undefined;

const parseFieldErrors = (errors: unknown): FieldError[] => {
  if (!Array.isArray(errors)) return [];
  return errors.flatMap((e): FieldError[] => {
    if (!isObject(e)) return [];
    const message = nonEmptyString(e.message) ?? nonEmptyString(e.msg);
    if (!message) return [];
    return [{ field: nonEmptyString(e.field) ?? nonEmptyString(e.path), message }];
  });
};

/**
 * Build an AppError from an HTTP status + (possibly empty / non-JSON) body.
 * Used by the transport layer right after a non-2xx response.
 */
export const errorFromResponse = (status: number, body: unknown, cause?: unknown): AppError => {
  const b: BackendErrorBody = isObject(body) ? body : {};
  const fieldErrors = parseFieldErrors(b.errors);
  const code = nonEmptyString(b.errorCode);
  const message =
    nonEmptyString(b.message) ??
    nonEmptyString(b.error) ??
    fieldErrors[0]?.message ??
    `Request failed with status ${status}`;

  return new AppError({
    message,
    status,
    code,
    kind: fieldErrors.length > 0 ? "validation" : kindFromStatus(status),
    fieldErrors,
    cause,
  });
};

/**
 * `@aglaya/api-core` throws `ApiError { status, code: "HTTP_ERROR" }` on any
 * non-2xx WITHOUT reading the body, so only the status survives. Legacy
 * services hit this path; the Orval mutator reads the body itself.
 */
const isApiCoreError = (e: unknown): e is Error & { status: number } =>
  e instanceof Error &&
  e.name === "ApiError" &&
  typeof (e as { status?: unknown }).status === "number";

/** Legacy error shapes carrying `statusCode` / `status` (old services, third-party libs). */
const legacyStatus = (e: unknown): number | undefined => {
  if (!isObject(e)) return undefined;
  const raw = e.statusCode ?? e.status;
  const n = Number(raw);
  return raw != null && Number.isFinite(n) ? n : undefined;
};

/**
 * Turn ANY thrown value into an AppError. Idempotent — AppErrors pass through.
 * Call this at every boundary (catch blocks, React Query callbacks, error
 * boundaries) and only work with the result.
 */
export const normalizeError = (error: unknown): AppError => {
  if (error instanceof AppError) return error;

  if (error instanceof DOMException && error.name === "AbortError") {
    return new AppError({
      message: "Request was cancelled",
      kind: "unknown",
      code: "ABORTED",
      cause: error,
    });
  }
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return new AppError({
      message: "Request timed out",
      kind: "network",
      code: "TIMEOUT",
      cause: error,
    });
  }
  // fetch() rejects with TypeError when the request never got a response.
  if (error instanceof TypeError && /fetch|network|load failed/i.test(error.message)) {
    return new AppError({
      message: error.message,
      kind: "network",
      code: "NETWORK_ERROR",
      cause: error,
    });
  }

  if (isApiCoreError(error)) {
    return new AppError({ message: error.message, status: error.status, cause: error });
  }

  if (error instanceof Error) {
    const status = legacyStatus(error);
    const legacyCode = (error as { code?: unknown }).code;
    const code =
      typeof legacyCode === "string" && legacyCode !== "HTTP_ERROR" ? legacyCode : undefined;
    return new AppError({
      message: error.message,
      status,
      code,
      // A plain Error with no status is a bug in our code, not a server reply.
      kind: status != null ? undefined : "client",
      cause: error,
    });
  }

  // A raw backend body that someone threw directly.
  if (isObject(error) && ("errorCode" in error || "errors" in error)) {
    return errorFromResponse(legacyStatus(error) ?? 400, error, error);
  }

  if (typeof error === "string") {
    return new AppError({ message: error, kind: "client", cause: error });
  }

  return new AppError({ message: "Unknown error", kind: "unknown", cause: error });
};
