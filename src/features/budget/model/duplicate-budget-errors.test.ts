import { describe, expect, it } from "vitest";

import { duplicateBudgetErrorCopy } from "@/features/budget";
import { errorFromResponse } from "@/shared/errors";

// Bodies match the backend error envelope after api-gamification-finances#16.
const fail = (status: number, body: Record<string, unknown>) => errorFromResponse(status, body);

describe("duplicateBudgetErrorCopy", () => {
  it("names the taken period on BUDGET_ALREADY_EXISTS", () => {
    const copy = duplicateBudgetErrorCopy(
      fail(409, {
        success: false,
        message: "Budget for 2026-4 already exists",
        errorCode: "BUDGET_ALREADY_EXISTS",
      }),
      "May 2026",
    );
    expect(copy).toEqual({
      title: "May 2026 is already taken",
      description: "You already have a budget for that period. Open or delete it first.",
    });
  });

  it("shows the backend's account ids for STALE_ACCOUNT_REFERENCES", () => {
    const message = "Cannot duplicate: accounts acc-1, acc-2 no longer exist";
    const copy = duplicateBudgetErrorCopy(
      fail(400, { success: false, message, errorCode: "STALE_ACCOUNT_REFERENCES" }),
      "May 2026",
    );
    expect(copy).toEqual({ title: "Source has stale account references", description: message });
  });

  it("treats 404 (missing or another user's budget) as a missing source", () => {
    const copy = duplicateBudgetErrorCopy(
      fail(404, { success: false, message: "Budget not found", errorCode: "BUDGET_NOT_FOUND" }),
      "May 2026",
    );
    expect(copy.title).toBe("Source budget missing");
  });

  it("explains validation failures with the field messages", () => {
    const copy = duplicateBudgetErrorCopy(
      fail(400, {
        success: false,
        message: "Validation failed",
        errorCode: "VALIDATION_ERROR",
        errors: [{ field: "month", message: "Month must be between 0 and 11" }],
      }),
      "May 2026",
    );
    expect(copy).toEqual({
      title: "Invalid year or month",
      description: "Month must be between 0 and 11",
    });
  });

  it("never leaks server internals on 5xx", () => {
    const copy = duplicateBudgetErrorCopy(
      fail(500, { message: "PrismaClient exploded" }),
      "May 2026",
    );
    expect(copy.title).toBe("Duplicate failed");
    expect(copy.description).not.toMatch(/Prisma/);
  });
});
