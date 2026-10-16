import { describe, expect, it } from "vitest";

import { loginErrorMessage } from "@/features/auth/model/login-errors";
import { AppError, errorFromResponse } from "@/shared/errors";

describe("loginErrorMessage", () => {
  it("names wrong credentials on 401", () => {
    expect(loginErrorMessage(errorFromResponse(401, { message: "Invalid credentials" }))).toBe(
      "Invalid email or password. Please try again.",
    );
  });

  it("explains rate limiting and network failures", () => {
    expect(loginErrorMessage(errorFromResponse(429, {}))).toMatch(/too many attempts/i);
    expect(loginErrorMessage(new AppError({ message: "x", kind: "network" }))).toMatch(/network/i);
  });

  it("never leaks server internals", () => {
    expect(
      loginErrorMessage(errorFromResponse(500, { message: "PrismaClient exploded" })),
    ).not.toMatch(/Prisma/);
  });
});
