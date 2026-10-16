import { getAuthToken } from "@/config/api-client";
import { AppError, errorFromResponse } from "@/shared/errors";

/*
 * Helpers for the legacy `apiClient` (@aglaya/api-core), used ONLY by feature
 * fetchers whose routes aren't in the OpenAPI spec yet (`TODO(openapi)`).
 * Delete this file when the last of them moves to the generated client.
 */

/** Auth options for `apiClient.*`. Throws if the user isn't signed in. */
export const legacyAuth = () => {
  const token = getAuthToken();
  if (!token) {
    throw new AppError({
      message: "No authentication token found",
      kind: "unauthorized",
      status: 401,
    });
  }
  return { authentication: { token }, options: { requiredAuth: true } };
};

/**
 * api-core already throws on non-2xx (status only — the body is dropped, see
 * normalizeError). This guards the rest: no status (never got a response) or
 * an unexpected 2xx. Returns the response BODY.
 */
export const expectStatus = <B>(
  result: { response: B; statusCode?: number },
  expected: number,
): B => {
  if (result.statusCode === undefined) {
    throw new AppError({ message: "Network request failed", kind: "network" });
  }
  if (result.statusCode >= 400) {
    // Keep the backend envelope (message, errorCode, field errors) when we get it.
    throw errorFromResponse(result.statusCode, result.response);
  }
  if (result.statusCode !== expected) {
    throw new AppError({
      message: `Unexpected status ${result.statusCode} (expected ${expected})`,
      status: result.statusCode,
    });
  }
  return result.response;
};
