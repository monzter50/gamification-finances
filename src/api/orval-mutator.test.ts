import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { customInstance } from "@/api/orval-mutator";
import { env } from "@/config/env";
import { resetSessionRevoked, subscribeSessionRevoked } from "@/config/session-revocation";
import { AppError } from "@/shared/errors";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  localStorage.setItem("authToken", "tok-123");
});

afterEach(() => {
  fetchMock.mockReset();
  localStorage.clear();
  resetSessionRevoked();
});

const call = <T = { status: number; data: unknown }>(
  url = "/api/budgets/b1/income",
  init?: RequestInit,
) => customInstance<T>(url, init);

describe("customInstance (Orval mutator)", () => {
  it("strips the duplicate /api prefix and sends the bearer token", async () => {
    fetchMock.mockResolvedValue(json(200, { success: true, data: [] }));

    await call("/api/budgets/b1/income?page=2", { method: "GET" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${env.apiBaseUrl}/budgets/b1/income?page=2`);
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer tok-123");
  });

  it("returns Orval's { status, data } shape on success", async () => {
    fetchMock.mockResolvedValue(json(201, { success: true, data: { id: "i1" } }));
    await expect(call()).resolves.toMatchObject({
      status: 201,
      data: { success: true, data: { id: "i1" } },
    });
  });

  it("throws an AppError built from the backend body — not 'HTTP 400'", async () => {
    fetchMock.mockResolvedValue(
      json(400, {
        success: false,
        message: "Validation failed",
        errorCode: "VALIDATION_ERROR",
        errors: [{ field: "amount", message: "Amount must be positive" }],
      }),
    );

    const err = await call().catch((e: unknown) => e);

    expect(err).toBeInstanceOf(AppError);
    expect(err).toMatchObject({
      kind: "validation",
      code: "VALIDATION_ERROR",
      status: 400,
      fieldErrors: [{ field: "amount", message: "Amount must be positive" }],
    });
  });

  it("turns a failed fetch into a network AppError", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(call()).rejects.toMatchObject({ kind: "network", code: "NETWORK_ERROR" });
  });

  it("signals session revocation on 440 when authenticated", async () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSessionRevoked(listener);
    fetchMock.mockResolvedValue(json(440, { errorCode: "SESSION_REVOKED" }));

    await expect(call()).rejects.toMatchObject({ kind: "session" });
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("does not signal revocation for anonymous requests", async () => {
    localStorage.clear();
    const listener = vi.fn();
    const unsubscribe = subscribeSessionRevoked(listener);
    fetchMock.mockResolvedValue(json(440, {}));

    await expect(call()).rejects.toBeInstanceOf(AppError);
    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  it("does not force a JSON content type on FormData uploads", async () => {
    fetchMock.mockResolvedValue(json(200, {}));
    const body = new FormData();
    body.append("file", new Blob(["x"]), "a.xlsx");

    await call("/api/transactions/import/xlsx/parse", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    });

    expect(new Headers(fetchMock.mock.calls[0][1]?.headers).has("Content-Type")).toBe(false);
  });

  it("handles 204 No Content", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(call()).resolves.toMatchObject({ status: 204, data: undefined });
  });
});
