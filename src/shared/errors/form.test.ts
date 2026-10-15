import { describe, expect, it, vi } from "vitest";

import { applyFieldErrors, errorFromResponse } from "@/shared/errors";

describe("applyFieldErrors", () => {
  it("sets known fields and collects the rest into a form message", () => {
    const setError = vi.fn();
    const err = errorFromResponse(400, {
      errorCode: "VALIDATION_ERROR",
      errors: [
        { field: "amount", message: "Amount must be positive" },
        { field: "accountId", message: "Account is archived" },
        { message: "Budget is closed" },
      ],
    });

    const result = applyFieldErrors(err, setError, ["amount", "date"]);

    expect(setError).toHaveBeenCalledTimes(1);
    expect(setError).toHaveBeenCalledWith("amount", {
      type: "server",
      message: "Amount must be positive",
    });
    expect(result).toEqual({ applied: 1, formMessage: "Account is archived. Budget is closed" });
  });

  it("returns no form message when every error landed on a field", () => {
    const err = errorFromResponse(400, {
      errors: [{ field: "date", message: "Date is required" }],
    });
    expect(applyFieldErrors(err, vi.fn(), ["date"]).formMessage).toBeUndefined();
  });

  it("falls back to the user message for non-validation errors", () => {
    const setError = vi.fn();
    const err = errorFromResponse(409, { errorCode: "BUDGET_ALREADY_EXISTS" });
    expect(applyFieldErrors(err, setError, ["month"])).toEqual({
      applied: 0,
      formMessage: "There's already a budget for that month.",
    });
    expect(setError).not.toHaveBeenCalled();
  });
});
