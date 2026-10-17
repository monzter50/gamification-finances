import { describe, expect, it } from "vitest";

import { AppError, errorFromResponse, normalizeError } from "@/shared/errors";

describe("errorFromResponse", () => {
  it("reads code, message and field errors from the backend validation envelope", () => {
    const e = errorFromResponse(400, {
      success: false,
      message: "Validation failed",
      error: "Validation failed",
      errorCode: "VALIDATION_ERROR",
      errors: [
        { field: "amount", message: "Amount must be positive" },
        { field: "date", message: "Date is required" },
      ],
    });

    expect(e).toBeInstanceOf(AppError);
    expect(e.kind).toBe("validation");
    expect(e.code).toBe("VALIDATION_ERROR");
    expect(e.status).toBe(400);
    expect(e.fieldErrors).toEqual([
      { field: "amount", message: "Amount must be positive" },
      { field: "date", message: "Date is required" },
    ]);
  });

  it("accepts the legacy `msg` / `path` validation shape", () => {
    const e = errorFromResponse(400, { errors: [{ path: "name", msg: "Required" }] });
    expect(e.fieldErrors).toEqual([{ field: "name", message: "Required" }]);
  });

  it("maps domain errors by status and keeps the backend code", () => {
    const e = errorFromResponse(404, {
      message: "Budget not found",
      errorCode: "BUDGET_NOT_FOUND",
    });
    expect(e.kind).toBe("not_found");
    expect(e.code).toBe("BUDGET_NOT_FOUND");
    expect(e.message).toBe("Budget not found");
  });

  it("survives empty and non-JSON bodies", () => {
    expect(errorFromResponse(502, undefined).kind).toBe("server");
    expect(errorFromResponse(500, "<html>Bad gateway</html>").code).toBe("INTERNAL_ERROR");
  });

  it("classifies the session-revoked status", () => {
    expect(errorFromResponse(440, { errorCode: "SESSION_REVOKED" }).kind).toBe("session");
  });
});

describe("normalizeError", () => {
  it("passes AppErrors through unchanged", () => {
    const original = new AppError({ message: "x", status: 409 });
    expect(normalizeError(original)).toBe(original);
  });

  it("treats a fetch TypeError as a network error", () => {
    const e = normalizeError(new TypeError("Failed to fetch"));
    expect(e.kind).toBe("network");
    expect(e.code).toBe("NETWORK_ERROR");
    expect(e.isRetryable).toBe(true);
  });

  it("treats a timeout as a retryable network error", () => {
    const e = normalizeError(new DOMException("timed out", "TimeoutError"));
    expect(e.code).toBe("TIMEOUT");
    expect(e.isRetryable).toBe(true);
  });

  it("keeps the status from @aglaya/api-core ApiError (legacy services)", () => {
    const apiError = Object.assign(new Error("HTTP 403: Forbidden"), {
      name: "ApiError",
      status: 403,
      code: "HTTP_ERROR",
    });
    const e = normalizeError(apiError);
    expect(e.kind).toBe("forbidden");
    expect(e.code).toBe("FORBIDDEN"); // generic HTTP_ERROR is not a useful code
  });

  it("reads status and code off legacy Error shapes ({ statusCode, code })", () => {
    const legacy = Object.assign(new Error("Budget not found"), {
      statusCode: 404,
      code: "BUDGET_NOT_FOUND",
    });
    const e = normalizeError(legacy);
    expect(e).toBeInstanceOf(AppError);
    expect(e.kind).toBe("not_found");
    expect(e.code).toBe("BUDGET_NOT_FOUND");
  });

  it("treats a plain Error without status as a client bug", () => {
    const e = normalizeError(new Error("undefined is not a function"));
    expect(e.kind).toBe("client");
    expect(e.isUnexpected).toBe(true);
  });

  it("handles strings and garbage", () => {
    expect(normalizeError("boom").message).toBe("boom");
    expect(normalizeError(null).kind).toBe("unknown");
    expect(normalizeError(42).kind).toBe("unknown");
  });
});
