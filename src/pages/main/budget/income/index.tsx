"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";

import { PageHeader, Stat } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccountsList } from "@/features/accounts";
import { useSnackbar, useIncome, useBudgetItems } from "@/hooks";
import type { Account } from "@/types/api";
import { MONTHS, INCOME_TYPES } from "@/types/budget";
import type { AddIncomeItemDTO, IncomeType, IncomeItem } from "@/types/budget";
import { calculateBudgetTotals } from "@/utils";

import { BudgetItemsFilters } from "../components/BudgetItemsFilters";
import {
  BudgetItemsTable,
  type BudgetItemPatch,
  type BudgetItemValues,
} from "../components/BudgetItemsTable";

const CURRENCY = "MXN";
const NO_ACCOUNTS: Account[] = [];

const toIncomeDto = (item: IncomeItem, patch: BudgetItemPatch = {}): AddIncomeItemDTO => ({
  description: patch.description ?? item.description,
  amount: patch.amount ?? item.amount,
  type: (patch.type ?? item.type) as IncomeType,
  accountId: patch.accountId ?? item.accountId,
});

export default function BudgetIncome() {
  const { id } = useParams();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { currentBudget, fetchBudgetById, addIncomeItem, updateIncomeItem, deleteIncomeItem } =
    useIncome();
  const { data: accounts = NO_ACCOUNTS } = useAccountsList();
  const hasFetched = useRef(false);

  // Client-side filtering + pagination over the full (already-loaded) item set.
  const incomeItems = currentBudget?.incomeItems ?? [];
  const table = useBudgetItems<IncomeItem>(incomeItems);

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

  const { totalIncome } = calculateBudgetTotals(currentBudget);

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
      await addIncomeItem(id, { ...values, type: values.type as IncomeType });
      table.goToLastPage();
    } catch (error) {
      showError("Failed to add income", error);
      throw error;
    }
  };

  const handleUpdate = async (itemId: string, patch: BudgetItemPatch) => {
    if (!id) {
      return;
    }
    const item = currentBudget.incomeItems.find((i) => i.id === itemId);
    if (!item) {
      return;
    }
    const data = toIncomeDto(item, patch);
    // Items created before accounts were required have none, and the API rejects them.
    if (!data.accountId) {
      snackbar.warning({
        title: "Pick an account first",
        description: "This item has no account yet. Set its Account cell, then edit the rest.",
      });
      throw new Error("Income item has no account");
    }
    try {
      await updateIncomeItem(id, itemId, data);
    } catch (error) {
      showError("Failed to update income", error);
      throw error;
    }
  };

  const handleRemove = async (itemId: string) => {
    if (!id) {
      return;
    }
    try {
      await deleteIncomeItem(id, itemId);
      snackbar.success({ title: "Income removed", description: "Income item has been removed." });
    } catch (error) {
      showError("Failed to remove income", error);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Income Management"
        description={`${MONTHS[currentBudget.month]} ${currentBudget.year}`}
        actions={
          <Button variant="outline" onClick={() => navigate(`/budget/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <Stat label="Total Income" value={totalIncome} currency={CURRENCY} tone="income" />

      <Card>
        <CardHeader>
          <CardTitle>Income Sources</CardTitle>
          <CardDescription>Click any cell to edit it. Use “New” to add a row.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <BudgetItemsFilters
            search={table.search}
            onSearchChange={table.setSearch}
            typeFilter={table.typeFilter}
            onTypeChange={table.setTypeFilter}
            typeOptions={INCOME_TYPES}
            hasActiveFilters={table.hasActiveFilters}
            onClear={table.clearFilters}
          />
          <BudgetItemsTable
            listLabel="Income items"
            items={table.pageItems}
            tone="income"
            currency={CURRENCY}
            typeOptions={INCOME_TYPES}
            accounts={accounts}
            currentPage={table.currentPage}
            totalPages={table.totalPages}
            totalItems={table.totalItems}
            itemsPerPage={table.itemsPerPage}
            hasActiveFilters={table.hasActiveFilters}
            emptyLabel="No income items yet"
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
