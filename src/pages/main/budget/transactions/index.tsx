"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useSnackbar, useBudget } from "@/hooks";
import { useTransactions } from "@/hooks/useTransactions";
import type { TransactionType, CreateTransactionDto } from "@/types/api";
import { MONTHS } from "@/types/budget";

import { TransactionModal } from "./components/TransactionModal";
import { TransactionsTable } from "./components/TransactionsTable";

export default function BudgetTransactions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { accounts } = useAuth();
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
  } = useForm<CreateTransactionDto>({
    defaultValues: {
      budgetId: id || "",
      description: "",
      amount: 0,
      type: "expense",
      category: "",
      vendor: "",
      owner: "",
      accountId: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  // Pagination state
  const [ currentPage, setCurrentPage ] = useState(1);
  const itemsPerPage = 5;

  // Memoize filters to prevent unnecessary re-renders
  const filters = useMemo(() => ({
    page: currentPage,
    limit: itemsPerPage,
  }), [ currentPage, itemsPerPage ]);

  // Use the transactions hook
  const {
    transactions: allTransactions,
    isLoading: isLoadingTransactions,
    pagination,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions({
    budgetId: id,
    filters,
  });

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

  // Use pagination from API or calculate from local data
  const paginatedTransactions = allTransactions;
  const totalPages = pagination?.pages || Math.ceil(allTransactions.length / itemsPerPage);

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
      {
        income: 0,
        expense: 0,
        savings: 0
      }
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
      budgetId: id || "",
      description: "",
      amount: 0,
      type: "expense",
      category: "",
      vendor: "",
      owner: "",
      accountId: "",
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
    date: string,
    vendor?: string,
    owner?: string,
    accountId?: string
  ) => {
    setIsEditMode(true);
    setEditingItemId(itemId);
    reset({
      budgetId: id || "",
      description,
      amount,
      type,
      category,
      vendor: vendor || "",
      owner: owner || "",
      accountId: accountId || "",
      date: new Date(date).toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingItemId(null);
    reset({
      budgetId: id || "",
      description: "",
      amount: 0,
      type: "expense",
      category: "",
      vendor: "",
      owner: "",
      accountId: "",
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
            totalItems={pagination?.total || allTransactions.length}
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
        accounts={accounts}
      />
    </div>
  );
}
