import { describe, expect, it } from "vitest";

import {
  calculateBudgetTotals,
  nextPeriod,
  normalizeBudget,
  sortBudgetsByPeriodDesc,
  summarizeByYear,
} from "@/features/budget/model/budget-totals";
import type { Budget } from "@/types/budget";

const budget = (overrides: Partial<Budget> = {}): Budget => ({
  id: "b1",
  userId: "u1",
  year: 2026,
  month: 4,
  incomeItems: [],
  expenseItems: [],
  createdAt: "",
  updatedAt: "",
  ...overrides,
});

const income = (amount: number) => ({
  description: "x",
  amount,
  type: "Cash" as const,
  accountId: "a1",
});
const expense = (amount: number) => ({ description: "x", amount, type: "Fixed" as const });

describe("budget totals", () => {
  it("normalizes missing item arrays", () => {
    const raw = {
      ...budget(),
      incomeItems: undefined,
      expenseItems: undefined,
    } as unknown as Budget;
    expect(normalizeBudget(raw)).toMatchObject({ incomeItems: [], expenseItems: [] });
  });

  it("computes savings and savings rate", () => {
    const totals = calculateBudgetTotals(
      budget({ incomeItems: [income(1000)], expenseItems: [expense(250)] }),
    );
    expect(totals).toEqual({ totalIncome: 1000, totalExpense: 250, savings: 750, savingsRate: 75 });
  });

  it("has a 0% savings rate when there is no income", () => {
    expect(calculateBudgetTotals(budget({ expenseItems: [expense(10)] })).savingsRate).toBe(0);
  });

  it("sums budgets per year", () => {
    const byYear = summarizeByYear([
      budget({ year: 2026, incomeItems: [income(100)], expenseItems: [expense(40)] }),
      budget({ id: "b2", year: 2026, month: 5, incomeItems: [income(50)] }),
      budget({ id: "b3", year: 2025, expenseItems: [expense(30)] }),
    ]);
    expect(byYear).toEqual({
      2026: { income: 150, expense: 40, savings: 110 },
      2025: { income: 0, expense: 30, savings: -30 },
    });
  });

  it("sorts newest period first", () => {
    const sorted = sortBudgetsByPeriodDesc([
      budget({ id: "old", year: 2025, month: 11 }),
      budget({ id: "new", year: 2026, month: 0 }),
      budget({ id: "mid", year: 2025, month: 12 - 1 - 1 }),
    ]);
    expect(sorted.map((b) => b.id)).toEqual(["new", "old", "mid"]);
  });

  it("rolls December over into next January", () => {
    expect(nextPeriod({ year: 2026, month: 3 })).toEqual({ year: 2026, month: 4 });
    expect(nextPeriod({ year: 2026, month: 11 })).toEqual({ year: 2027, month: 0 });
  });
});
