import type { Budget } from "@/types/budget";

/** Local calendar day as `yyyy-mm-dd` (not UTC, so late-evening entries keep their day). */
export const toIsoDay = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** The budget that covers a `yyyy-mm-dd` day (budgets are monthly; `month` is 0-based). */
export const findBudgetIdForDay = (
  budgets: readonly Pick<Budget, "id" | "year" | "month">[],
  day: string,
): string | null => {
  const [year, month] = day.split("-").map(Number);
  return budgets.find((b) => b.year === year && b.month === month - 1)?.id ?? null;
};

/** Today when it falls in the budget's month, otherwise the month's first day. */
export const defaultDayForBudget = (budget: Pick<Budget, "year" | "month">): string => {
  const today = new Date();
  return today.getFullYear() === budget.year && today.getMonth() === budget.month
    ? toIsoDay(today)
    : `${budget.year}-${String(budget.month + 1).padStart(2, "0")}-01`;
};
