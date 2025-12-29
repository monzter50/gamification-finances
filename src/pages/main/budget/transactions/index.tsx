"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSnackbar, useBudget, useMounted } from "@/hooks";
import { useTransactions } from "@/hooks/useTransactions";
import type { TransactionType, CreateTransactionRequest } from "@/types/api";
import { MONTHS } from "@/types/budget";

import { TransactionModal } from "./components/TransactionModal";
import { TransactionsTable } from "./components/TransactionsTable";

export default function BudgetTransactions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { currentBudget, isLoading, fetchBudgetById } = useBudget();
  const hasFetched = useRef(false);

  const [ isModalOpen, setIsModalOpen ] = useState(false);
  const [ isEditMode, setIsEditMode ] = useState(false);
  const [ editingItemId, setEditingItemId ] = useState<string | null>(null);

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTransactionRequest>({
    defaultValues: {
      description: "",
      amount: 0,
      type: "expense",
      category: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  // Pagination state
  const [ currentPage, setCurrentPage ] = useState(1);
  const itemsPerPage = 5;

  // Use the transactions hook
  const {
    transactions: allTransactions,
    isLoading: isLoadingTransactions,
    loadTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions({
    budgetYear: currentBudget?.year || new Date().getFullYear(),
    budgetMonth: currentBudget?.month || new Date().getMonth(),
  });

  const { isMounted, cleanup } = useMounted();

  useEffect(() => {
    if (id && !hasFetched.current) {
      hasFetched.current = true;
      fetchBudgetById(id).catch((error) => {
        snackbar.error({
          title: "Failed to load budget",
          description: error instanceof Error ? error.message : "An error occurred",
        });
        navigate("/budget");
      });
    }
  }, [ id, fetchBudgetById, snackbar, navigate ]);

  // Load transactions when budget is ready
  useEffect(() => {
    if (!currentBudget) { return; }

    if (isMounted()) {
      loadTransactions().catch(null);
    }

    return cleanup;
  }, [ currentBudget, loadTransactions, isMounted, cleanup ]);

  // Paginated transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allTransactions.slice(startIndex, endIndex);
  }, [ allTransactions, currentPage, itemsPerPage ]);

  const totalPages = Math.ceil(allTransactions.length / itemsPerPage);

  // Calculate totals
  const totals = useMemo(() => {
    return allTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.income += transaction.amount;
        } else if (transaction.type === "expense") {
          acc.expense += transaction.amount;
        } else if (transaction.type === "savings") {
          acc.savings += transaction.amount;
        }
        return acc;
      },
      { income: 0,
        expense: 0,
        savings: 0 }
    );
  }, [ allTransactions ]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [ currentPage, totalPages ]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [ currentPage ]);

  if (isLoading || !currentBudget) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading budget...</p>
      </div>
    );
  }

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingItemId(null);
    reset({
      description: "",
      amount: 0,
      type: "expense",
      category: "",
      date: new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (
    itemId: string,
    description: string,
    amount: number,
    type: TransactionType,
    category: string,
    date: string
  ) => {
    setIsEditMode(true);
    setEditingItemId(itemId);
    reset({
      description,
      amount,
      type,
      category,
      date: new Date(date).toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingItemId(null);
    reset({
      description: "",
      amount: 0,
      type: "expense",
      category: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEditMode && editingItemId) {
        await updateTransaction(editingItemId, data);
      } else {
        await addTransaction(data);
      }

      handleCloseModal();
      // Reset to page 1 when adding new transaction
      if (!isEditMode) {
        setCurrentPage(1);
      }
    } catch {
      // Error already handled in the hook
    }
  });

  const handleRemoveTransaction = async (itemId: string) => {
    try {
      await deleteTransaction(itemId);

      // Adjust page if current page becomes empty
      const newTotalPages = Math.ceil((allTransactions.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch {
      // Error already handled in the hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(`/budget/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold">Transaction Tracking</h2>
          <p className="text-muted-foreground">
            {MONTHS[currentBudget.month]} {currentBudget.year}
          </p>
        </div>
        <Button onClick={handleOpenAddModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${totals.income.toLocaleString("es-MX")} MXN
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              ${totals.expense.toLocaleString("es-MX")} MXN
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${totals.savings.toLocaleString("es-MX")} MXN
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            Track all your financial transactions for this budget period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionsTable
            transactions={paginatedTransactions}
            isLoading={isLoadingTransactions}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={allTransactions.length}
            onEdit={handleOpenEditModal}
            onRemove={handleRemoveTransaction}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        register={register}
        setValue={setValue}
        watch={watch}
        errors={errors}
      />
    </div>
  );
}
