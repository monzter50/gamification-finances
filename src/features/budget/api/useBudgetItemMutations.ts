import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  deleteApiBudgetsIdExpenseExpenseId,
  postApiBudgetsIdExpense,
  putApiBudgetsIdExpenseExpenseId,
} from "@/api/generated/expense/expense";
import {
  deleteApiBudgetsIdIncomeIncomeId,
  postApiBudgetsIdIncome,
  putApiBudgetsIdIncomeIncomeId,
} from "@/api/generated/income/income";
import type { AddExpenseItemRequest, AddIncomeItemRequest } from "@/api/generated/models";
import { invalidateFor } from "@/api/invalidation";
import { unwrap } from "@/api/unwrap";

/*
 * Cache effect: POST / PUT / DELETE on items return only the touched item +
 * totals, never the budget — so invalidate (detail + list totals), never
 * setQueryData. Returning the promise keeps the mutation pending until the
 * refetch lands, so tables never flash stale totals.
 *
 * Errors toast globally via the MutationCache (`meta.errorTitle`); callers use
 * `mutateAsync` so the inline cell rolls back on failure.
 */

/** Request bodies, re-exported so components never import `@/api/generated`. */
export type { AddExpenseItemRequest, AddIncomeItemRequest };

export interface ItemUpdate<T> {
  itemId: string;
  data: T;
}

// ---- Income ----------------------------------------------------------------

export const useAddIncomeItem = (budgetId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddIncomeItemRequest) => unwrap(postApiBudgetsIdIncome(budgetId, data)),
    meta: { errorTitle: "Couldn't add income" },
    onSuccess: () => invalidateFor(qc, "budgetItem"),
  });
};

export const useUpdateIncomeItem = (budgetId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }: ItemUpdate<AddIncomeItemRequest>) =>
      unwrap(putApiBudgetsIdIncomeIncomeId(budgetId, itemId, data)),
    meta: { errorTitle: "Couldn't update income" },
    onSuccess: () => invalidateFor(qc, "budgetItem"),
  });
};

export const useDeleteIncomeItem = (budgetId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => unwrap(deleteApiBudgetsIdIncomeIncomeId(budgetId, itemId)),
    meta: { errorTitle: "Couldn't remove income" },
    onSuccess: () => invalidateFor(qc, "budgetItem"),
  });
};

// ---- Expense ---------------------------------------------------------------

export const useAddExpenseItem = (budgetId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddExpenseItemRequest) => unwrap(postApiBudgetsIdExpense(budgetId, data)),
    meta: { errorTitle: "Couldn't add expense" },
    onSuccess: () => invalidateFor(qc, "budgetItem"),
  });
};

export const useUpdateExpenseItem = (budgetId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }: ItemUpdate<AddExpenseItemRequest>) =>
      unwrap(putApiBudgetsIdExpenseExpenseId(budgetId, itemId, data)),
    meta: { errorTitle: "Couldn't update expense" },
    onSuccess: () => invalidateFor(qc, "budgetItem"),
  });
};

export const useDeleteExpenseItem = (budgetId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => unwrap(deleteApiBudgetsIdExpenseExpenseId(budgetId, itemId)),
    meta: { errorTitle: "Couldn't remove expense" },
    onSuccess: () => invalidateFor(qc, "budgetItem"),
  });
};
