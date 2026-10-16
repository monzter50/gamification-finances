"use client";

import { useQueryClient } from "@tanstack/react-query";
import { FileSpreadsheet } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
  Stat,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { budgetDetailQuery, useBudgetsList } from "@/features/budget";
import { useTransactions, useTransactionSummary } from "@/hooks";
import type { CreateTransactionDto, TransactionFilters, UpdateTransactionDto } from "@/types/api";
import type { Budget } from "@/types/budget";

import { TransactionFormModal } from "./components/TransactionFormModal";
import {
  DEFAULT_FILTERS,
  TransactionListFilters,
  type TransactionListFilterValues,
} from "./components/TransactionListFilters";
import { TransactionsTable } from "./components/TransactionsTable";
import { findBudgetIdForDay, toIsoDay } from "./components/transactionTable";
import { useTransactionDetails } from "./useTransactionDetails";

const ITEMS_PER_PAGE = 10;
const DEFAULT_CURRENCY = "MXN";
const NO_BUDGETS: Budget[] = [];

export default function Transactions() {
  const navigate = useNavigate();
  const { accounts, refreshAccounts } = useAuth();
  const queryClient = useQueryClient();
  const { data: budgets = NO_BUDGETS } = useBudgetsList();
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) {
      return;
    }
    hasLoaded.current = true;
    // The accounts list in context is only loaded at login and can be stale.
    void refreshAccounts();
  }, [refreshAccounts]);

  const [filterValues, setFilterValues] = useState<TransactionListFilterValues>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterValues]);

  // Memoized: useTransactions reloads whenever this object's identity changes.
  const apiFilters: TransactionFilters = useMemo(
    () => ({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      ...(filterValues.type !== "all" && { type: filterValues.type }),
      ...(filterValues.startDate && { startDate: filterValues.startDate }),
      ...(filterValues.endDate && { endDate: filterValues.endDate }),
    }),
    [currentPage, filterValues],
  );

  const {
    transactions,
    isLoading,
    pagination,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions({
    budgetId: filterValues.budgetId || undefined,
    filters: apiFilters,
    notifySuccess: false,
  });

  const {
    summary,
    loading: isLoadingSummary,
    refetch: refetchSummary,
  } = useTransactionSummary({
    autoFetch: true,
  });

  const refreshTotals = () => {
    refetchSummary();
    void refreshAccounts();
  };

  // Description and the linked plan are edited in the details panel.
  const details = useTransactionDetails({
    transactions,
    budgets,
    // Budget summaries carry no items; the details panel needs the full budget.
    fetchBudgetById: (budgetId) => queryClient.fetchQuery(budgetDetailQuery(budgetId)),
    updateTransaction,
    onSaved: refreshTotals,
  });

  // Mutations rethrow after the hook's error toast, so rows can roll back.
  const handleCreate = async (values: CreateTransactionDto) => {
    await addTransaction(values);
    setCurrentPage(1);
    refreshTotals();
  };

  const handleUpdate = async (id: string, patch: UpdateTransactionDto) => {
    await updateTransaction(id, patch);
    refreshTotals();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      refreshTotals();
      const remaining = (pagination?.total ?? transactions.length) - 1;
      const newPages = Math.max(1, Math.ceil(remaining / ITEMS_PER_PAGE));
      if (currentPage > newPages) {
        setCurrentPage(newPages);
      }
    } catch {
      // error toast already surfaced by the hook
    }
  };

  const totalPages = pagination?.pages ?? 1;
  const totalItems = pagination?.total ?? transactions.length;
  const hasActiveFilters = JSON.stringify(filterValues) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="All income & expenses across your budgets. Every change updates your account balance."
        actions={
          <Button variant="outline" onClick={() => navigate("/transactions/import-xlsx")}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Import Excel
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Stat
          label="Total Income"
          value={summary?.totalIncome ?? 0}
          currency={DEFAULT_CURRENCY}
          tone="income"
          loading={isLoadingSummary}
        />
        <Stat
          label="Total Expenses"
          value={summary?.totalExpense ?? 0}
          currency={DEFAULT_CURRENCY}
          tone="expense"
          loading={isLoadingSummary}
        />
        <Stat
          label="Net Balance"
          value={summary?.netBalance ?? 0}
          currency={DEFAULT_CURRENCY}
          tone="auto"
          loading={isLoadingSummary}
        />
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            Click any cell to edit it. Use “New” to add a transaction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionsTable
            transactions={transactions}
            isLoading={isLoading}
            accounts={accounts}
            currency={DEFAULT_CURRENCY}
            defaultDate={toIsoDay(new Date())}
            resolveBudgetId={(day) => findBudgetIdForDay(budgets, day)}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={() => setFilterValues(DEFAULT_FILTERS)}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onOpenDetails={details.openDetails}
            onRemove={handleDelete}
            onNextPage={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            onPreviousPage={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          />
        </CardContent>
      </Card>

      <TransactionFormModal {...details.modalProps} accounts={accounts} />
    </div>
  );
}
