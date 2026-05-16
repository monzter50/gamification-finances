"use client";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useSnackbar, useBudget, useTransactions, useTransactionSummary } from "@/hooks";
import type { CreateTransactionDto, Transaction, TransactionFilters } from "@/types/api";
import type { Budget } from "@/types/budget";

import { TransactionFormModal } from "./components/TransactionFormModal";
import { DEFAULT_FILTERS, TransactionListFilters, type TransactionListFilterValues } from "./components/TransactionListFilters";
import { TransactionsTable } from "../budget/transactions/components/TransactionsTable";

const ITEMS_PER_PAGE = 10;

export default function Transactions() {
  const snackbar = useSnackbar();
  const { accounts, refreshAccounts } = useAuth();
  const { fetchBudgetById, fetchBudgets } = useBudget();

  // -------- Budgets (for filter dropdown + modal item linking) --------
  const [ budgets, setBudgets ] = useState<Budget[]>([]);
  const [ activeBudget, setActiveBudget ] = useState<Budget | null>(null);
  const hasLoadedBudgets = useRef(false);

  useEffect(() => {
    if (hasLoadedBudgets.current) { return; }
    hasLoadedBudgets.current = true;

    fetchBudgets()
      .then(setBudgets)
      .catch((err) => {
        snackbar.error({
          title: "Failed to load budgets",
          description: err instanceof Error ? err.message : "An error occurred",
        });
      });
  }, [ fetchBudgets, snackbar ]);

  // -------- Filters + pagination --------
  const [ filterValues, setFilterValues ] = useState<TransactionListFilterValues>(DEFAULT_FILTERS);
  const [ currentPage, setCurrentPage ] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [ filterValues ]);

  const apiFilters: TransactionFilters = useMemo(() => {
    const f: TransactionFilters = { page: currentPage,
      limit: ITEMS_PER_PAGE };
    if (filterValues.type !== "all")  { f.type      = filterValues.type; }
    if (filterValues.startDate)       { f.startDate = filterValues.startDate; }
    if (filterValues.endDate)         { f.endDate   = filterValues.endDate; }
    return f;
  }, [ currentPage, filterValues ]);

  const {
    transactions,
    isLoading: isLoadingTransactions,
    pagination,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions({
    budgetId: filterValues.budgetId || undefined,
    filters:  apiFilters,
  });

  // -------- Global financial summary --------
  const { summary, loading: isLoadingSummary, refetch: refetchSummary } = useTransactionSummary({ autoFetch: true });

  // -------- Modal state --------
  const [ isModalOpen, setIsModalOpen ] = useState(false);
  const [ editingTransaction, setEditingTransaction ] = useState<Transaction | null>(null);
  const [ isSubmitting, setIsSubmitting ] = useState(false);

  /**
   * When the user picks a specific budget in the filter OR opens the modal
   * we need its income/expense items to populate the linked-item selects.
   */
  useEffect(() => {
    if (!filterValues.budgetId) {
      setActiveBudget(null);
      return;
    }
    // Already cached in `budgets`? use that first
    const cached = budgets.find((b) => b.id === filterValues.budgetId);
    if (cached?.incomeItems && cached?.expenseItems) {
      setActiveBudget(cached);
      return;
    }
    fetchBudgetById(filterValues.budgetId)
      .then(setActiveBudget)
      .catch(() => setActiveBudget(null));
  }, [ filterValues.budgetId, budgets, fetchBudgetById ]);

  // -------- Handlers --------
  const handleOpenCreate = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  // TransactionsTable.onEdit signature passes extra legacy args we don't need —
  // we just look up the full row by id from local state.
  const handleOpenEdit = useCallback((itemId: string) => {
    const tx = transactions.find((t) => t.id === itemId);
    if (!tx) { return; }
    setEditingTransaction(tx);
    setIsModalOpen(true);
  }, [ transactions ]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleSubmitTransaction = async (values: CreateTransactionDto) => {
    setIsSubmitting(true);
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, values);
      } else {
        await addTransaction(values);
        setCurrentPage(1);
      }
      // A successful mutation invalidates accounts/budgets/summary implicitly
      // on the server — refresh the summary card too.
      // Guide §9: tx mutations invalidate accounts + summaries.
      refetchSummary();
      refreshAccounts();
      handleCloseModal();
    } catch {
      // error toast already surfaced by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await deleteTransaction(itemId);
      // Guide §9: tx mutations invalidate accounts + summaries.
      refetchSummary();
      refreshAccounts();
      // Step a page back if we just emptied the last one
      const remaining = (pagination?.total ?? transactions.length) - 1;
      const newPages = Math.max(1, Math.ceil(remaining / ITEMS_PER_PAGE));
      if (currentPage > newPages) { setCurrentPage(newPages); }
    } catch {
      // error toast already surfaced by the hook
    }
  };

  const totalPages = pagination?.pages ?? 1;
  const totalItems = pagination?.total ?? transactions.length;

  // For the modal: we want the *active* budget if the user filtered to one,
  // otherwise we still pass the full list for selection + linking.
  const modalBudgets = useMemo<Budget[]>(() => {
    if (activeBudget) {
      // Ensure activeBudget is first (so it's pre-selected in new transactions
      // via form default logic upstream if needed)
      return [ activeBudget, ...budgets.filter((b) => b.id !== activeBudget.id) ];
    }
    return budgets;
  }, [ activeBudget, budgets ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Transactions</h2>
          <p className="text-muted-foreground">
            All income & expenses across your budgets. Every mutation updates your account balance atomically.
          </p>
        </div>
        <Button onClick={handleOpenCreate} disabled={budgets.length === 0 || accounts.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Summary cards (global) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${(summary?.totalIncome ?? 0).toLocaleString("es-MX")} MXN
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.incomeCount ?? 0} transaction{summary?.incomeCount === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              ${(summary?.totalExpense ?? 0).toLocaleString("es-MX")} MXN
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.expenseCount ?? 0} transaction{summary?.expenseCount === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(summary?.netBalance ?? 0) >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}`}>
              ${(summary?.netBalance ?? 0).toLocaleString("es-MX")} MXN
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoadingSummary ? "Refreshing…" : "Income − Expenses"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Narrow down the list by budget, type, or date range.</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionListFilters
            value={filterValues}
            budgets={budgets}
            onChange={setFilterValues}
            onReset={() => setFilterValues(DEFAULT_FILTERS)}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            {totalItems} total · page {currentPage} of {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionsTable
            transactions={transactions}
            isLoading={isLoadingTransactions}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onEdit={(id) => handleOpenEdit(id)}
            onRemove={handleDelete}
            onNextPage={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            onPreviousPage={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          />
        </CardContent>
      </Card>

      {/* Modal */}
      <TransactionFormModal
        open={isModalOpen}
        editingTransaction={editingTransaction}
        accounts={accounts}
        budgets={modalBudgets}
        onClose={handleCloseModal}
        onSubmit={handleSubmitTransaction}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
