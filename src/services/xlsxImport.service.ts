/**
 * Excel Import Service
 *  - parse(file): multipart .xlsx upload via raw `fetch` (api-core forces JSON
 *    content-type, which corrupts multipart bodies).
 *  - confirm(payload): plain JSON via `apiClient`.
 */
import type { JSONTypes } from "@aglaya/api-core";

import { apiClient, getAuthToken } from "@/config/api-client";
import { env } from "@/config/env";
import { authLogger } from "@/config/logger";
import type {
  ConfirmXlsxDto,
  ConfirmXlsxResult,
  ParseResponseData,
} from "@/pages/main/transactions/xlsx-import/types";
import type { ApiResponse } from "@/types/api";
import { ApplicationError } from "@/utils/errors";

class XlsxImportService {
  /** Upload the .xlsx and get parsed (unsaved) rows + payment sources. */
  async parse(file: File): Promise<ParseResponseData> {
    const token = getAuthToken();
    if (!token) {
      throw new ApplicationError("No authentication token found", "NO_TOKEN");
    }

    const form = new FormData();
    form.append("file", file);

    let res: Response;
    try {
      res = await fetch(`${env.apiBaseUrl}/transactions/import/xlsx/parse`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // no Content-Type (multipart boundary)
        body: form,
      });
    } catch (err) {
      authLogger.error("Workbook upload network error", err);
      throw new ApplicationError(
        "Network error. Please check your connection and try again.",
        "NETWORK_ERROR",
      );
    }

    const json = (await res.json().catch(() => null)) as
      | (ApiResponse<ParseResponseData> & { errorCode?: string })
      | null;

    if (!res.ok || !json?.success) {
      throw new ApplicationError(
        json?.message ?? "Could not read the workbook.",
        json?.errorCode,
        res.status,
      );
    }

    return json.data;
  }

  /** Bulk-create the reviewed batch (atomic on the server). */
  async confirm(payload: ConfirmXlsxDto): Promise<ConfirmXlsxResult> {
    const token = getAuthToken();
    if (!token) {
      throw new ApplicationError("No authentication token found", "NO_TOKEN");
    }

    const { status, response } = await apiClient.post<ApiResponse<ConfirmXlsxResult>>(
      "/transactions/import/xlsx/confirm",
      {
        // Cast to the api-core JSON type: ConfirmXlsxDto is a named interface
        // (no index signature) with nested arrays, so it isn't structurally a
        // JSONObject. The payload is plain JSON data at runtime.
        body: payload as unknown as JSONTypes,
        authentication: { token },
        options: { requiredAuth: true },
      },
    );

    if (status !== "ok") {
      throw new ApplicationError("Import failed. Please try again.");
    }

    return response.data;
  }
}

export const xlsxImportService = new XlsxImportService();
