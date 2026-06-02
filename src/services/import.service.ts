/**
 * Statement Import Service
 *
 * Two calls:
 *  - extract(file): multipart upload. Uses a raw `fetch` (NOT the api-core
 *    client) because `@aglaya/api-core` forces `Content-Type: application/json`,
 *    which corrupts multipart bodies (the browser must set the boundary).
 *  - confirm(payload): plain JSON, goes through `apiClient` like other services.
 */
import type { JSONTypes } from "@aglaya/api-core";

import { apiClient, getAuthToken } from "@/config/api-client";
import { env } from "@/config/env";
import { authLogger } from "@/config/logger";
import type {
  ConfirmImportDto,
  ConfirmImportResult,
  ExtractResponseData,
} from "@/pages/main/transactions/import/types";
import type { ApiResponse } from "@/types/api";
import { ApplicationError } from "@/utils/errors";

class ImportStatementService {
  /** Upload a statement image and get the extracted (unsaved) rows. */
  async extract(file: File): Promise<ExtractResponseData> {
    const token = getAuthToken();
    if (!token) {
      throw new ApplicationError("No authentication token found", "NO_TOKEN");
    }

    const form = new FormData();
    form.append("file", file);

    let res: Response;
    try {
      res = await fetch(`${env.apiBaseUrl}/transactions/import/extract`, {
        method:  "POST",
        // No Content-Type — the browser sets multipart boundary automatically.
        headers: { Authorization: `Bearer ${token}` },
        body:    form,
      });
    } catch (err) {
      authLogger.error("Statement upload network error", err);
      throw new ApplicationError(
        "Network error. Please check your connection and try again.",
        "NETWORK_ERROR",
      );
    }

    const json = (await res.json().catch(() => null)) as
      | (ApiResponse<ExtractResponseData> & { errorCode?: string })
      | null;

    if (!res.ok || !json?.success) {
      throw new ApplicationError(
        json?.message ?? "Could not extract transactions from the image.",
        json?.errorCode,
        res.status,
      );
    }

    return json.data;
  }

  /** Bulk-create the user-reviewed batch (atomic on the server). */
  async confirm(payload: ConfirmImportDto): Promise<ConfirmImportResult> {
    const token = getAuthToken();
    if (!token) {
      throw new ApplicationError("No authentication token found", "NO_TOKEN");
    }

    const { status, response } = await apiClient.post<ApiResponse<ConfirmImportResult>>(
      "/transactions/import/confirm",
      {
        // Cast to the api-core JSON type: ConfirmImportDto is a named interface
        // (no index signature) with a nested array, so it isn't structurally a
        // JSONObject. The payload is plain JSON data at runtime.
        body:           payload as unknown as JSONTypes,
        authentication: { token },
        options:        { requiredAuth: true },
      },
    );

    if (status !== "ok") {
      throw new ApplicationError("Import failed. Please try again.");
    }

    return response.data;
  }
}

export const importStatementService = new ImportStatementService();
