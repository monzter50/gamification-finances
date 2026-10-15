/**
 * Orval custom mutator (fetch client) — the transport for every generated call.
 *
 * Orval invokes it as `customInstance<ResponseUnion>(url, requestInit)` where
 * `requestInit.body` is already serialized (JSON string or FormData) and
 * expects back the per-route union `{ status, data, headers }`.
 *
 * Why plain fetch instead of `@aglaya/api-core`: api-core throws on any non-2xx
 * BEFORE reading the body, so the backend's `errorCode`, message, and
 * validation `errors[]` were lost and users saw "HTTP 400: Bad Request".
 * Here every failure becomes an `AppError` built from the real response body
 * (see `@/shared/errors`).
 *
 * Responsibilities kept in this one place:
 *   - base URL + "/api" prefix de-duplication
 *   - Bearer auth header
 *   - error normalization (HTTP, network, timeout)
 *   - 440 → global session-revoked signal
 */
import { getAuthToken } from "@/config/api-client";
import { env } from "@/config/env";
import { isSessionRevoked } from "@/config/session";
import { notifySessionRevoked } from "@/config/session-revocation";
import { errorFromResponse, normalizeError } from "@/shared/errors";

/** Abort requests that hang. React Query (or the caller) decides whether to retry. */
const REQUEST_TIMEOUT_MS = 20_000;

/**
 * Orval bakes the spec path ("/api/budgets/{id}/income") into the URL, while
 * `env.apiBaseUrl` already ends with "/api" — strip the duplicate prefix.
 */
const stripApiPrefix = (url: string): string => (url.startsWith("/api/") ? url.slice(4) : url);

/** Parse a response body without throwing on empty / non-JSON payloads. */
const readBody = async (res: Response): Promise<unknown> => {
  if (res.status === 204) return undefined;
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

export const customInstance = async <T>(url: string, init: RequestInit = {}): Promise<T> => {
  const token = getAuthToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  // FormData sets its own multipart boundary — never force a Content-Type on it.
  if (init.body instanceof FormData) headers.delete("Content-Type");

  let res: Response;
  try {
    res = await fetch(`${env.apiBaseUrl}${stripApiPrefix(url)}`, {
      ...init,
      headers,
      signal: init.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    // Offline, DNS, CORS, timeout, abort → AppError(kind: "network" | …)
    throw normalizeError(err);
  }

  const body = await readBody(res);

  if (!res.ok) {
    const error = errorFromResponse(res.status, body);
    // Single active session: 440 = a newer login superseded this device. Only
    // react when we actually sent a token (ignore anonymous 4xx like a failed login).
    if (token && isSessionRevoked(error)) notifySessionRevoked();
    throw error;
  }

  // Reshape into Orval's `{ status, data, headers }` union. The cast is needed
  // because T is a per-status discriminated union we can't narrow here.
  return { status: res.status, data: body, headers: res.headers } as unknown as T;
};

// Helper aliases Orval-generated code sometimes references.
export type ErrorType<Error> = Error;
export type BodyType<BodyData> = BodyData;

export default customInstance;
