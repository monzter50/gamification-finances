import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import {
  fetchMonthlySummary,
  fetchTransactionSummary,
  fetchTransactions,
} from "@/features/transactions/api/transactionFetchers";
import type { TransactionFilters } from "@/types/api";

/*
 * Everything here moves with every transaction mutation, plus account and
 * budget changes — invalidate via `invalidateFor(qc, "transaction")`.
 */

/** One page of transactions (+ totals over the whole filtered set). */
export const transactionsListQuery = (filters: TransactionFilters) =>
  queryOptions({
    queryKey: queryKeys.transactions.list({ ...filters }),
    queryFn: () => fetchTransactions(filters),
    // Paging/filtering keeps the previous page on screen instead of a skeleton.
    placeholderData: keepPreviousData,
  });

/** All-time income / expense / net balance. */
export const transactionSummaryQuery = () =>
  queryOptions({
    queryKey: queryKeys.transactions.summary(),
    queryFn: fetchTransactionSummary,
  });

/** One month's totals + category breakdown. `month` is 0-based like budgets. */
export const monthlySummaryQuery = (year: number, month: number) =>
  queryOptions({
    queryKey: queryKeys.transactions.summary({ year, month }),
    queryFn: () => fetchMonthlySummary(year, month + 1),
  });

export const useTransactionsList = (filters: TransactionFilters) =>
  useQuery(transactionsListQuery(filters));

export const useTransactionSummary = () => useQuery(transactionSummaryQuery());

export const useMonthlySummary = (year: number, month: number) =>
  useQuery(monthlySummaryQuery(year, month));
