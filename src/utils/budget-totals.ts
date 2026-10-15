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
 * from the previous `budgetService.calculateTotals` (`savings`/`savingsRate`)
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
