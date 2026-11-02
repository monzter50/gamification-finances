import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateFor } from "@/api/invalidation";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/features/transactions/api/transactionFetchers";
import type { CreateTransactionDto, UpdateTransactionDto } from "@/types/api";

/*
 * A transaction moves account balances, budget totals, summaries and XP —
 * `invalidateFor("transaction")` refreshes all of them (src/api/invalidation.ts),
 * so callers never refresh accounts or summaries by hand.
 *
 * Errors toast globally via the MutationCache (`meta.errorTitle`); inline
 * tables use `mutateAsync` so the row rolls back on failure.
 */

export const useCreateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTransactionDto) => createTransaction(dto),
    meta: { errorTitle: "Couldn't add transaction" },
    onSuccess: () => invalidateFor(qc, "transaction"),
  });
};

export interface UpdateTransactionVariables {
  id: string;
  dto: UpdateTransactionDto;
}

export const useUpdateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: UpdateTransactionVariables) => updateTransaction(id, dto),
    meta: { errorTitle: "Couldn't update transaction" },
    onSuccess: () => invalidateFor(qc, "transaction"),
  });
};

export const useDeleteTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    meta: { errorTitle: "Couldn't remove transaction" },
    onSuccess: () => invalidateFor(qc, "transaction"),
  });
};
