import { type ReactNode, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { useAccountsList } from "@/features/accounts";
import { useTransactionsList } from "@/features/transactions/api/transactionQueries";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useUpdateTransaction,
} from "@/features/transactions/api/useTransactionMutations";
import { TransactionFormModal } from "@/features/transactions/components/TransactionFormModal";
import { TransactionsTable } from "@/features/transactions/components/TransactionsTable";
import { useTransactionDetails } from "@/features/transactions/hooks/useTransactionDetails";
import { ErrorPanel } from "@/shared/errors";
import type {
  Account,
  CreateTransactionDto,
  TransactionFilters,
  TransactionTotals,
  UpdateTransactionDto,
} from "@/types/api";
import type { Budget } from "@/types/budget";

const NO_ACCOUNTS: Account[] = [];
const CURRENCY = "MXN";

export interface TransactionsPanelProps {
  title: string;
  /** What to show — paging is handled here and restarts when this changes. */
  filters: Omit<TransactionFilters, "page" | "limit">;
  pageSize: number;
  /** Budgets the details panel can link to. */
  budgets: Budget[];
  /** Prefilled date in the "+ New" row (`yyyy-mm-dd`). */
  defaultDate: string;
  // eslint-disable-next-line no-unused-vars
  resolveBudgetId: (day: string) => string | null;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  /** Renders above the table, e.g. totals over the filtered set. */
  // eslint-disable-next-line no-unused-vars
  renderTotals?: (totals: TransactionTotals | null, loading: boolean) => ReactNode;
}

// TODO(i18n)
/**
 * A paginated, inline-editable transactions list with its details panel.
 * Mutations invalidate everything a transaction touches (balances, budgets,
 * summaries), so callers don't refresh anything by hand.
 */
export const TransactionsPanel = ({
  title,
  filters,
  pageSize,
  budgets,
  defaultDate,
  resolveBudgetId,
  hasActiveFilters,
  onClearFilters,
  renderTotals,
}: TransactionsPanelProps) => {
  // The page belongs to one set of filters: new filters start back at page 1.
  const filtersKey = JSON.stringify(filters);
  const [paging, setPaging] = useState({ filtersKey, page: 1 });
  const page = paging.filtersKey === filtersKey ? paging.page : 1;
  const setPage = (next: number) => setPaging({ filtersKey, page: next });

  const list = useTransactionsList({ ...filters, page, limit: pageSize });
  const { data: accounts = NO_ACCOUNTS } = useAccountsList();
  const create = useCreateTransaction();
  const update = useUpdateTransaction();
  const remove = useDeleteTransaction();
  const details = useTransactionDetails(budgets);

  const transactions = list.data?.transactions ?? [];
  const totalItems = list.data?.pagination.total ?? 0;
  const totalPages = Math.max(1, list.data?.pagination.pages ?? 1);

  // Rejections propagate so the "+ New" row keeps its values and cells roll back.
  const handleCreate = async (values: CreateTransactionDto) => {
    await create.mutateAsync(values);
    setPage(1); // newest first — the new row is on page 1
  };

  const handleUpdate = async (id: string, dto: UpdateTransactionDto) => {
    await update.mutateAsync({ id, dto });
  };

  const handleRemove = (id: string) =>
    remove.mutate(id, {
      onSuccess: () => {
        const lastPage = Math.max(1, Math.ceil((totalItems - 1) / pageSize));
        if (page > lastPage) setPage(lastPage);
      },
    });

  return (
    <>
      {renderTotals?.(list.data?.totals ?? null, list.isPending)}

      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Click any cell to edit it. Use “New” to add a transaction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {list.isError ? (
            <ErrorPanel
              error={list.error}
              title="Couldn't load transactions"
              onRetry={() => void list.refetch()}
            />
          ) : (
            <TransactionsTable
              transactions={transactions}
              isLoading={list.isPending}
              accounts={accounts}
              currency={CURRENCY}
              defaultDate={defaultDate}
              resolveBudgetId={resolveBudgetId}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={onClearFilters}
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              onCreate={handleCreate}
              onUpdate={handleUpdate}
              onOpenDetails={(id) => {
                const tx = transactions.find((t) => t.id === id);
                if (tx) details.openDetails(tx);
              }}
              onRemove={handleRemove}
              onNextPage={() => setPage(Math.min(page + 1, totalPages))}
              onPreviousPage={() => setPage(Math.max(page - 1, 1))}
            />
          )}
        </CardContent>
      </Card>

      <TransactionFormModal {...details.modalProps} accounts={accounts} />
    </>
  );
};
