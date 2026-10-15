"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";

import { PageHeader, Stat } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSnackbar, useBudget, useBudgetItems } from "@/hooks";
import { MONTHS, EXPENSE_TYPES } from "@/types/budget";
import type { AddExpenseItemDTO, ExpenseType, ExpenseItem } from "@/types/budget";
import { calculateBudgetTotals } from "@/utils";

import { BudgetItemsFilters } from "../components/BudgetItemsFilters";
import {
  BudgetItemsTable,
  type BudgetItemPatch,
  type BudgetItemValues,
} from "../components/BudgetItemsTable";

const CURRENCY = "MXN";

const toExpenseDto = (item: ExpenseItem, patch: BudgetItemPatch = {}): AddExpenseItemDTO => ({
  description: patch.description ?? item.description,
  amount: patch.amount ?? item.amount,
  type: (patch.type ?? item.type) as ExpenseType,
});

export default function BudgetExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { currentBudget, fetchBudgetById, addExpenseItem, updateExpenseItem, deleteExpenseItem } =
    useBudget();
  const hasFetched = useRef(false);

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
  }, [id, fetchBudgetById, snackbar, navigate]);

  // Full-screen state only for the INITIAL budget load — never on table ops.
  if (!currentBudget) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading budget...</p>
      </div>
    );
  }

  const { totalExpense } = calculateBudgetTotals(currentBudget);

  const showError = (title: string, error: unknown) => {
    snackbar.error({
      title,
      description: error instanceof Error ? error.message : "An error occurred",
    });
  };

  // Create and update rethrow so the row keeps the typed value (create) or
  // rolls the cell back (update).
  const handleCreate = async (values: BudgetItemValues) => {
    if (!id) {
      return;
    }
    try {
      await addExpenseItem(id, {
        description: values.description,
        amount: values.amount,
        type: values.type as ExpenseType,
      });
      table.goToLastPage();
    } catch (error) {
      showError("Failed to add expense", error);
      throw error;
    }
  };

  const handleUpdate = async (itemId: string, patch: BudgetItemPatch) => {
    if (!id) {
      return;
    }
    const item = currentBudget.expenseItems.find((i) => i.id === itemId);
    if (!item) {
      return;
    }
    try {
      await updateExpenseItem(id, itemId, toExpenseDto(item, patch));
    } catch (error) {
      showError("Failed to update expense", error);
      throw error;
    }
  };

  const handleRemove = async (itemId: string) => {
    if (!id) {
      return;
    }
    try {
      await deleteExpenseItem(id, itemId);
      snackbar.success({ title: "Expense removed", description: "Expense item has been removed." });
    } catch (error) {
      showError("Failed to remove expense", error);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense Management"
        description={`${MONTHS[currentBudget.month]} ${currentBudget.year}`}
        actions={
          <Button variant="outline" onClick={() => navigate(`/budget/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <Stat label="Total Expenses" value={totalExpense} currency={CURRENCY} tone="expense" />

      <Card>
        <CardHeader>
          <CardTitle>Expense Items</CardTitle>
          <CardDescription>Click any cell to edit it. Use “New” to add a row.</CardDescription>
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
            listLabel="Expense items"
            items={table.pageItems}
            tone="expense"
            currency={CURRENCY}
            typeOptions={EXPENSE_TYPES}
            defaultType="Variable"
            currentPage={table.currentPage}
            totalPages={table.totalPages}
            totalItems={table.totalItems}
            itemsPerPage={table.itemsPerPage}
            hasActiveFilters={table.hasActiveFilters}
            emptyLabel="No expense items yet"
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onRemove={handleRemove}
            onNextPage={table.nextPage}
            onPreviousPage={table.prevPage}
            onItemsPerPageChange={table.setItemsPerPage}
            onClearFilters={table.clearFilters}
          />
        </CardContent>
      </Card>
    </div>
  );
}
