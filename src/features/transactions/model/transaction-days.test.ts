import { afterEach, describe, expect, it, vi } from "vitest";

import {
  defaultDayForBudget,
  findBudgetIdForDay,
  toIsoDay,
} from "@/features/transactions/model/transaction-days";

describe("transaction days", () => {
  afterEach(() => vi.useRealTimers());

  it("formats the local calendar day, zero-padded", () => {
    expect(toIsoDay(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
  });

  it("finds the budget whose month covers a day (0-based months)", () => {
    const budgets = [
      { id: "apr", year: 2026, month: 3 },
      { id: "may", year: 2026, month: 4 },
    ];
    expect(findBudgetIdForDay(budgets, "2026-05-31")).toBe("may");
    expect(findBudgetIdForDay(budgets, "2026-06-01")).toBeNull();
  });

  it("defaults to today inside the budget's month, else its first day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 17));
    expect(defaultDayForBudget({ year: 2026, month: 4 })).toBe("2026-05-17");
    expect(defaultDayForBudget({ year: 2026, month: 2 })).toBe("2026-03-01");
  });
});
