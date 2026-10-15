import { describe, expect, it } from "vitest";

import {
  AppError,
  errorFromResponse,
  normalizeError,
  toUserMessage,
  toUserTitle,
} from "@/shared/errors";

describe("toUserMessage", () => {
  it("uses our copy for a known backend code", () => {
    const e = errorFromResponse(409, {
      message: "Unique constraint",
      errorCode: "BUDGET_ALREADY_EXISTS",
    });
    expect(toUserMessage(e)).toBe("There's already a budget for that month.");
  });

  it("shows backend field messages for validation errors", () => {
    const e = errorFromResponse(400, {
      errorCode: "VALIDATION_ERROR",
      errors: [
        { field: "amount", message: "Amount must be positive" },
        { field: "amount", message: "Amount must be positive" },
        { field: "date", message: "Date is required" },
      ],
    });
    expect(toUserMessage(e)).toBe("Amount must be positive. Date is required");
  });

  it("shows the backend message for user-oriented 4xx without a catalog entry", () => {
    const e = errorFromResponse(409, { message: "This item is locked", errorCode: "ITEM_LOCKED" });
    expect(toUserMessage(e)).toBe("This item is locked");
  });

  it("never leaks technical text from 5xx responses", () => {
    const e = errorFromResponse(500, { message: "PrismaClientKnownRequestError: P2034 deadlock" });
    expect(toUserMessage(e)).toBe("Something went wrong on our side. Try again in a moment.");
  });

  it("never shows raw 'HTTP 400: Bad Request' from the legacy client", () => {
    const legacy = Object.assign(new Error("HTTP 400: Bad Request"), {
      name: "ApiError",
      status: 400,
    });
    expect(toUserMessage(legacy)).toBe("Some information isn't valid. Check it and try again.");
  });

  it("never shows a JS exception message to the user", () => {
    expect(toUserMessage(new Error("Cannot read properties of undefined"))).toBe(
      "Something went wrong. Try again, or reload the page.",
    );
  });

  it("has offline copy and a matching title", () => {
    const e = normalizeError(new TypeError("Failed to fetch"));
    expect(toUserMessage(e)).toMatch(/connection/);
    expect(toUserTitle(e)).toBe("You're offline");
  });

  it("works on raw unknown values", () => {
    expect(toUserMessage(undefined)).toBe("Something went wrong. Try again.");
    expect(toUserMessage(new AppError({ message: "x", status: 429 }))).toMatch(/Wait a moment/);
  });
});
