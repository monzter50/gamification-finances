"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSnackbar, useBudget, useBudgetItems } from "@/hooks";
import { budgetService } from "@/services/budget.service";
import { MONTHS, EXPENSE_TYPES } from "@/types/budget";
import type { ExpenseType, ExpenseItem } from "@/types/budget";

import { BudgetItemsFilters } from "../components/BudgetItemsFilters";
import { BudgetItemsTable, type BudgetItemRow } from "../components/BudgetItemsTable";
import { ExpenseModal } from "./components/ExpenseModal";

const CURRENCY = "MXN";

export default function BudgetExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const {
    currentBudget,
    fetchBudgetById,
    addExpenseItem,
    updateExpenseItems,
    deleteExpenseItem,
  } = useBudget();
  const hasFetched = useRef(false);

  const [ isModalOpen, setIsModalOpen ] = useState(false);
  const [ isEditMode, setIsEditMode ] = useState(false);
  const [ editingItemId, setEditingItemId ] = useState<string | null>(null);
  const [ expenseItemForm, setExpenseItemForm ] = useState({
    description: "",
    amount: "",
    type: "" as ExpenseType | "",
  });

  // Client-side filtering + pagination over the full (already-loaded) item set.
  const expenseItems = currentBudget?.expenseItems ?? [];
  const table = useBudgetItems<ExpenseItem>(expenseItems);

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

  // Full-screen state only for the INITIAL budget load — never on table ops.
  if (!currentBudget) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading budget...</p>
      </div>
    );
  }

  const { totalExpense } = budgetService.calculateTotals(currentBudget);

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingItemId(null);
    setExpenseItemForm({ description: "",
      amount: "",
      type: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: BudgetItemRow) => {
    setIsEditMode(true);
    setEditingItemId(item.id ?? null);
    setExpenseItemForm({
      description: item.description,
      amount: item.amount.toString(),
      type: item.type as ExpenseType,
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (field: "description" | "amount" | "type", value: string) => {
    setExpenseItemForm((prev) => ({ ...prev,
      [field]: value }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingItemId(null);
    setExpenseItemForm({ description: "",
      amount: "",
      type: "" });
  };

  const handleSaveExpenseItem = async () => {
    if (!expenseItemForm.description || !expenseItemForm.amount || !expenseItemForm.type || !id) {
      snackbar.warning({
        title: "Missing fields",
        description: "Please fill in all required fields.",
      });
      return;
    }

    try {
      if (isEditMode && editingItemId) {
        const updatedExpenseItems = currentBudget.expenseItems.map((item) =>
          item.id === editingItemId
            ? {
              description: expenseItemForm.description,
              amount: Number(expenseItemForm.amount),
              type: expenseItemForm.type as ExpenseType,
            }
            : { description: item.description,
              amount: item.amount,
              type: item.type },
        );
        await updateExpenseItems(id, updatedExpenseItems);
        snackbar.success({ title: "Expense updated!",
          description: "Expense item has been updated successfully." });
      } else {
        await addExpenseItem(id, {
          description: expenseItemForm.description,
          amount: Number(expenseItemForm.amount),
          type: expenseItemForm.type as ExpenseType,
        });
        snackbar.success({ title: "Expense added!",
          description: "Expense item has been added successfully." });
      }
      handleCloseModal();
    } catch (error) {
      snackbar.error({
        title: isEditMode ? "Failed to update expense" : "Failed to add expense",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const handleRemoveExpenseItem = async (itemId: string) => {
    if (!id) { return; }
    try {
      await deleteExpenseItem(id, itemId);
      snackbar.success({ title: "Expense removed",
        description: "Expense item has been removed." });
    } catch (error) {
      snackbar.error({
        title: "Failed to remove expense",
        description: error instanceof Error ? error.message : "An error occurred",
      });
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
          <h2 className="text-3xl font-bold">Expense Management</h2>
          <p className="text-muted-foreground">
            {MONTHS[currentBudget.month]} {currentBudget.year}
          </p>
        </div>
        <Button onClick={handleOpenAddModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Total Expense Card */}
      <Card>
        <CardHeader>
          <CardTitle>Total Expenses</CardTitle>
          <CardDescription>Sum of all expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-expense">
            ${totalExpense.toLocaleString("es-MX")} MXN
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {expenseItems.length} expense {expenseItems.length === 1 ? "item" : "items"}
          </p>
        </CardContent>
      </Card>

      {/* Expense Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Items</CardTitle>
          <CardDescription>Manage your expenses for this budget period</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <BudgetItemsFilters
            search={table.search}
            onSearchChange={table.setSearch}
            typeFilter={table.typeFilter}
            onTypeChange={table.setTypeFilter}
            typeOptions={EXPENSE_TYPES}
            hasActiveFilters={table.hasActiveFilters}
            onClear={table.clearFilters}
          />
          <BudgetItemsTable
            items={table.pageItems}
            tone="expense"
            currency={CURRENCY}
            currentPage={table.currentPage}
            totalPages={table.totalPages}
            totalItems={table.totalItems}
            itemsPerPage={table.itemsPerPage}
            hasActiveFilters={table.hasActiveFilters}
            emptyLabel="No expense items yet"
            onEdit={handleOpenEditModal}
            onRemove={handleRemoveExpenseItem}
            onNextPage={table.nextPage}
            onPreviousPage={table.prevPage}
            onItemsPerPageChange={table.setItemsPerPage}
            onClearFilters={table.clearFilters}
          />
        </CardContent>
      </Card>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        formData={expenseItemForm}
        onClose={handleCloseModal}
        onChange={handleFormChange}
        onSave={handleSaveExpenseItem}
      />
    </div>
  );
}
