"use client";

import { FileSpreadsheet, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useSnackbar, useBudget, useTransactions, useTransactionSummary } from "@/hooks";
import type { CreateTransactionDto, Transaction, TransactionFilters } from "@/types/api";
import type { Budget } from "@/types/budget";

import { TransactionFormModal } from "./components/TransactionFormModal";
import { DEFAULT_FILTERS, TransactionListFilters, type TransactionListFilterValues } from "./components/TransactionListFilters";
import { TransactionsTable } from "../budget/transactions/components/TransactionsTable";

const ITEMS_PER_PAGE = 10;
const DEFAULT_CURRENCY = "MXN";

export default function Transactions() {
  const snackbar = useSnackbar();
  const navigate = useNavigate();
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

  useEffect(() => { setCurrentPage(1); }, [ filterValues ]);

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

  useEffect(() => {
    if (!filterValues.budgetId) {
      setActiveBudget(null);
      return;
    }
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
      refetchSummary();
      refreshAccounts();
      const remaining = (pagination?.total ?? transactions.length) - 1;
      const newPages = Math.max(1, Math.ceil(remaining / ITEMS_PER_PAGE));
      if (currentPage > newPages) { setCurrentPage(newPages); }
    } catch {
      // error toast already surfaced by the hook
    }
  };

  const totalPages = pagination?.pages ?? 1;
  const totalItems = pagination?.total ?? transactions.length;

  const modalBudgets = useMemo<Budget[]>(() => {
    if (activeBudget) {
      return [ activeBudget, ...budgets.filter((b) => b.id !== activeBudget.id) ];
    }
    return budgets;
  }, [ activeBudget, budgets ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="All income & expenses across your budgets. Every mutation updates your account balance atomically."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/transactions/import-xlsx")}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Import Excel
            </Button>
            <Button onClick={handleOpenCreate} disabled={budgets.length === 0 || accounts.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        }
      />

      {/* Summary cards (global) */}
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
