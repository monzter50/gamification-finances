import type { Budget } from "@/types/budget";

/**
 * Guarantee the child-collection invariant the `Budget` type promises.
 *
 * The API can omit `incomeItems`/`expenseItems` entirely (e.g. a freshly
 * created budget with no items yet), even though the type declares them as
 * always-present arrays. Normalize at the boundary so every downstream
 * consumer can trust the type instead of re-guarding.
 */
export const normalizeBudget = (budget: Budget): Budget => ({
  ...budget,
  incomeItems: budget.incomeItems ?? [],
  expenseItems: budget.expenseItems ?? [],
});

/**
 * Calculate budget totals locally (client-side, no I/O).
 *
 * Pure domain math over an in-memory Budget aggregate. Lives here — not in a
 * service — because it performs no network calls. Return shape is preserved
 * from the previous `budget service` (`savings`/`savingsRate`)
 * to keep existing consumers working. Tolerates missing child arrays defensively.
 */
export const calculateBudgetTotals = (budget: Budget) => {
  const totalIncome = (budget.incomeItems ?? []).reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = (budget.expenseItems ?? []).reduce((sum, item) => sum + item.amount, 0);
  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  return {
    totalIncome,
    totalExpense,
    savings,
    savingsRate,
  };
};

export interface YearlyTotals {
  income: number;
  expense: number;
  savings: number;
}

/** Planned income/expense/savings per year, across that year's budgets. */
export const summarizeByYear = (budgets: Budget[]): Record<number, YearlyTotals> => {
  const byYear: Record<number, YearlyTotals> = {};
  for (const budget of budgets) {
    const { totalIncome, totalExpense } = calculateBudgetTotals(budget);
    const year = (byYear[budget.year] ??= { income: 0, expense: 0, savings: 0 });
    year.income += totalIncome;
    year.expense += totalExpense;
    year.savings = year.income - year.expense;
  }
  return byYear;
};

/** Newest period first. */
export const sortBudgetsByPeriodDesc = (budgets: Budget[]): Budget[] =>
  [...budgets].sort((a, b) => b.year - a.year || b.month - a.month);

/** Next calendar period after `source` (December rolls into next January). */
export const nextPeriod = (source: Pick<Budget, "year" | "month">) => ({
  month: (source.month + 1) % 12,
  year: source.month === 11 ? source.year + 1 : source.year,
});
