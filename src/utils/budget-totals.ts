import type { Budget } from "@/types/budget";

/**
 * Calculate budget totals locally (client-side, no I/O).
 *
 * Pure domain math over an in-memory Budget aggregate. Lives here — not in a
 * service — because it performs no network calls. Return shape is preserved
 * from the previous `budgetService.calculateTotals` (`savings`/`savingsRate`)
 * to keep existing consumers working.
 */
export const calculateBudgetTotals = (budget: Budget) => {
  const totalIncome = budget.incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = budget.expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  return {
    totalIncome,
    totalExpense,
    savings,
    savingsRate,
  };
};
