import { afterEach, describe, expect, it } from "vitest";

import { clearSession, hasValidSession, saveSession } from "@/features/auth/model/session";

describe("session storage", () => {
  afterEach(() => localStorage.clear());

  it("is valid until the expiry, then not", () => {
    saveSession("tok", 60, 1_000);
    expect(hasValidSession(1_000 + 59_999)).toBe(true);
    expect(hasValidSession(1_000 + 60_000)).toBe(false);
  });

  it("needs both a token and an expiry", () => {
    localStorage.setItem("authToken", "tok");
    expect(hasValidSession()).toBe(false);
  });

  it("clears everything", () => {
    saveSession("tok", 60);
    clearSession();
    expect(hasValidSession()).toBe(false);
    expect(localStorage.getItem("authExpiry")).toBeNull();
  });
});
