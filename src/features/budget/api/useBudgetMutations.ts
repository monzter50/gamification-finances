import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postApiBudgetsIdDuplicate } from "@/api/generated/budgets/budgets";
import { invalidateFor } from "@/api/invalidation";
import { unwrapData } from "@/api/unwrap";
import { type BudgetPeriod, createBudget } from "@/features/budget/api/budgetFetchers";
import { normalizeBudget } from "@/features/budget/model/budget-totals";
import type { Budget } from "@/types/budget";

/** Errors toast globally via the MutationCache with `meta.errorTitle`. */
export const useCreateBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (period: BudgetPeriod) => createBudget(period),
    meta: { errorTitle: "Couldn't create budget" },
    onSuccess: () => invalidateFor(qc, "budget"),
  });
};

export interface DuplicateBudgetVariables extends BudgetPeriod {
  sourceId: string;
}

/**
 * Clones income and expense items into a new period (transactions are not
 * copied). `silent`: the caller maps the backend errorCode to its own copy
 * with `duplicateBudgetErrorCopy`.
 */
export const useDuplicateBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ sourceId, year, month }: DuplicateBudgetVariables): Promise<Budget> => {
      const created = await unwrapData(postApiBudgetsIdDuplicate(sourceId, { year, month }));
      // TODO(spec): response data is typed Record<string, unknown> — declare Budget in the spec.
      return normalizeBudget(created as unknown as Budget);
    },
    meta: { silent: true },
    onSuccess: () => invalidateFor(qc, "budget"),
  });
};
