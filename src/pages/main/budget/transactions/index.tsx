"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Stat } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { BUDGET_CURRENCY, BudgetPageShell } from "@/features/budget";
import { useTransactions } from "@/hooks/useTransactions";
import type { CreateTransactionDto, Transaction, UpdateTransactionDto } from "@/types/api";

import { TransactionFormModal } from "../../transactions/components/TransactionFormModal";
import { TransactionsTable } from "../../transactions/components/TransactionsTable";
import { defaultDayForBudget } from "../../transactions/components/transactionTable";

const ITEMS_PER_PAGE = 5;
const CURRENCY = BUDGET_CURRENCY;

export default function BudgetTransactions() {
  const { id = "" } = useParams();
  const { accounts, refreshAccounts } = useAuth();
  const hasFetched = useRef(false);

  const [currentPage, setCurrentPage] = useState(1);
  // Memoized: useTransactions reloads whenever this object's identity changes.
  const filters = useMemo(() => ({ page: currentPage, limit: ITEMS_PER_PAGE }), [currentPage]);

  const {
    transactions,
    isLoading: isLoadingTransactions,
    pagination,
    totals,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions({ budgetId: id, filters, notifySuccess: false });

  // Details panel (description, linked plan)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id && !hasFetched.current) {
      hasFetched.current = true;
      // TODO(slice 3: transactions): drop once transaction mutations invalidate accounts.
      void refreshAccounts();
    }
  }, [id, refreshAccounts]);

  const totalPages = pagination?.pages ?? 1;
  const totalItems = pagination?.total ?? transactions.length;

  // Mutations rethrow after the hook's error toast, so rows can roll back.
  const handleCreate = async (values: CreateTransactionDto) => {
    await addTransaction(values);
    setCurrentPage(1);
    void refreshAccounts();
  };

  const handleUpdate = async (itemId: string, patch: UpdateTransactionDto) => {
    await updateTransaction(itemId, patch);
    void refreshAccounts();
  };

  const handleSubmitDetails = async (values: CreateTransactionDto) => {
    if (!editingTransaction) {
      return;
    }
    setIsSubmitting(true);
    try {
      await updateTransaction(editingTransaction.id, values);
      void refreshAccounts();
      setEditingTransaction(null);
    } catch {
      // error toast already surfaced by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await deleteTransaction(itemId);
      void refreshAccounts();
      const newPages = Math.max(1, Math.ceil((totalItems - 1) / ITEMS_PER_PAGE));
      if (currentPage > newPages) {
        setCurrentPage(newPages);
      }
    } catch {
      // error toast already surfaced by the hook
    }
  };

  return (
    <BudgetPageShell budgetId={id} title="Transaction Tracking" backTo={`/budget/${id}`}>
      {(currentBudget) => (
        <>
          {/* Totals come from the API over the whole budget, not just this page. */}
          <div className="grid gap-4 md:grid-cols-3">
            <Stat
              label="Total Income"
              value={totals?.income ?? 0}
              currency={CURRENCY}
              tone="income"
              loading={isLoadingTransactions}
            />
            <Stat
              label="Total Expenses"
              value={totals?.expense ?? 0}
              currency={CURRENCY}
              tone="expense"
              loading={isLoadingTransactions}
            />
            <Stat
              label="Total Savings"
              value={totals?.savings ?? 0}
              currency={CURRENCY}
              tone="neutral"
              loading={isLoadingTransactions}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                Click any cell to edit it. Use “New” to add a transaction.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionsTable
                transactions={transactions}
                isLoading={isLoadingTransactions}
                accounts={accounts}
                currency={CURRENCY}
                defaultDate={defaultDayForBudget(currentBudget)}
                resolveBudgetId={() => currentBudget.id}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
                onOpenDetails={(txId) =>
                  setEditingTransaction(transactions.find((t) => t.id === txId) ?? null)
                }
                onRemove={handleRemove}
                onNextPage={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                onPreviousPage={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              />
            </CardContent>
          </Card>

          <TransactionFormModal
            open={editingTransaction !== null}
            editingTransaction={editingTransaction}
            accounts={accounts}
            budgets={[currentBudget]}
            onClose={() => setEditingTransaction(null)}
            onSubmit={handleSubmitDetails}
            isSubmitting={isSubmitting}
          />
        </>
      )}
    </BudgetPageShell>
  );
}
