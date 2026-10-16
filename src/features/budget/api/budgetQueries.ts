import { queryOptions, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import {
  type BudgetListFilters,
  fetchBudget,
  fetchBudgets,
} from "@/features/budget/api/budgetFetchers";

/**
 * The user's budgets, optionally narrowed to a period. Totals move with item
 * mutations — invalidate via `invalidateFor(qc, "budget" | "budgetItem")`.
 */
export const budgetsListQuery = (filters: BudgetListFilters = {}) =>
  queryOptions({
    queryKey: queryKeys.budgets.list({ ...filters }),
    queryFn: () => fetchBudgets(filters),
  });

/** One budget with its income and expense items (the full aggregate). */
export const budgetDetailQuery = (id: string) =>
  queryOptions({
    queryKey: queryKeys.budgets.detail(id),
    queryFn: () => fetchBudget(id),
  });

export const useBudgetsList = (filters: BudgetListFilters = {}) =>
  useQuery(budgetsListQuery(filters));

export const useBudgetDetail = (id: string) => useQuery(budgetDetailQuery(id));
