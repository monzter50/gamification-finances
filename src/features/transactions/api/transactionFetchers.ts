import { expectStatus, legacyAuth } from "@/api/legacy-client";
import { apiClient } from "@/config/api-client";
import type {
  ApiResponse,
  CreateTransactionDto,
  FinancialSummary,
  MonthlySummary,
  Pagination,
  Transaction,
  TransactionFilters,
  TransactionTotals,
  UpdateTransactionDto,
} from "@/types/api";

/*
 * Legacy fetchers: /transactions CRUD and summaries aren't in the OpenAPI spec
 * yet (only the xlsx import is). Moved from src/services/transaction.service.ts.
 * Delete each one as soon as its route lands in the spec.
 */

export interface TransactionPage {
  transactions: Transaction[];
  pagination: Pagination;
  /** Totals over the whole filtered set, not just this page. */
  totals: TransactionTotals | null;
}

type ListBody = ApiResponse<Transaction[]> & {
  pagination: Pagination;
  totals?: TransactionTotals;
};

const toQuery = (filters: TransactionFilters): string => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.append(key, String(value));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
};

// TODO(openapi): GET /transactions missing from spec
export const fetchTransactions = async (filters: TransactionFilters): Promise<TransactionPage> => {
  const result = await apiClient.get<ListBody>(`/transactions${toQuery(filters)}`, legacyAuth());
  const body = expectStatus(result, 200);
  return {
    transactions: body.data ?? [],
    pagination: body.pagination,
    totals: body.totals ?? null,
  };
};

// TODO(openapi): POST /transactions missing from spec
export const createTransaction = async (dto: CreateTransactionDto): Promise<Transaction> => {
  const result = await apiClient.post<ApiResponse<Transaction>>("/transactions", {
    body: { ...dto },
    ...legacyAuth(),
  });
  return expectStatus(result, 201).data;
};

// TODO(openapi): PUT /transactions/{id} missing from spec
export const updateTransaction = async (
  id: string,
  dto: UpdateTransactionDto,
): Promise<Transaction> => {
  const result = await apiClient.put<ApiResponse<Transaction>>(`/transactions/${id}`, {
    body: { ...dto },
    ...legacyAuth(),
  });
  return expectStatus(result, 200).data;
};

// TODO(openapi): DELETE /transactions/{id} missing from spec
export const deleteTransaction = async (id: string): Promise<void> => {
  const result = await apiClient.delete<ApiResponse<void>>(`/transactions/${id}`, legacyAuth());
  expectStatus(result, 200);
};

// TODO(openapi): GET /transactions/summary missing from spec
export const fetchTransactionSummary = async (): Promise<FinancialSummary> => {
  const result = await apiClient.get<ApiResponse<FinancialSummary>>(
    "/transactions/summary",
    legacyAuth(),
  );
  return expectStatus(result, 200).data;
};

/** `month` is 1-based here — the API's convention for this route. */
// TODO(openapi): GET /transactions/monthly/{year}/{month} missing from spec
export const fetchMonthlySummary = async (year: number, month: number): Promise<MonthlySummary> => {
  const result = await apiClient.get<ApiResponse<MonthlySummary>>(
    `/transactions/monthly/${year}/${month}`,
    legacyAuth(),
  );
  return expectStatus(result, 200).data;
};
