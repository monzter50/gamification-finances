"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";

import { PageHeader, Stat } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSnackbar, useBudget, useBudgetItems } from "@/hooks";
import { budgetService } from "@/services/budget.service";
import { MONTHS, INCOME_TYPES } from "@/types/budget";
import type { IncomeType, IncomeItem } from "@/types/budget";

import { BudgetItemsFilters } from "../components/BudgetItemsFilters";
import { BudgetItemsTable, type BudgetItemRow } from "../components/BudgetItemsTable";
import { IncomeModal } from "./components/IncomeModal";

const CURRENCY = "MXN";

export default function BudgetIncome() {
  const { id } = useParams();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const {
    currentBudget,
    fetchBudgetById,
    addIncomeItem,
    updateIncomeItems,
    deleteIncomeItem,
  } = useBudget();
  const hasFetched = useRef(false);

  const [ isModalOpen, setIsModalOpen ] = useState(false);
  const [ isEditMode, setIsEditMode ] = useState(false);
  const [ editingItemId, setEditingItemId ] = useState<string | null>(null);
  const [ incomeItemForm, setIncomeItemForm ] = useState({
    description: "",
    amount: "",
    type: "" as IncomeType | "",
  });

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
  }, [ id, fetchBudgetById, snackbar, navigate ]);

  // Full-screen state only for the INITIAL budget load — never on table ops.
  if (!currentBudget) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading budget...</p>
      </div>
    );
  }

  const { totalIncome } = budgetService.calculateTotals(currentBudget);

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingItemId(null);
    setIncomeItemForm({ description: "",
      amount: "",
      type: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: BudgetItemRow) => {
    setIsEditMode(true);
    setEditingItemId(item.id ?? null);
    setIncomeItemForm({
      description: item.description,
      amount: item.amount.toString(),
      type: item.type as IncomeType,
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (field: "description" | "amount" | "type", value: string) => {
    setIncomeItemForm((prev) => ({ ...prev,
      [field]: value }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingItemId(null);
    setIncomeItemForm({ description: "",
      amount: "",
      type: "" });
  };

  const handleSaveIncomeItem = async () => {
    if (!incomeItemForm.description || !incomeItemForm.amount || !incomeItemForm.type || !id) {
      snackbar.warning({
        title: "Missing fields",
        description: "Please fill in all required fields.",
      });
      return;
    }

    try {
      if (isEditMode && editingItemId) {
        const updatedIncomeItems = currentBudget.incomeItems.map((item) =>
          item.id === editingItemId
            ? {
              description: incomeItemForm.description,
              amount: Number(incomeItemForm.amount),
              type: incomeItemForm.type as IncomeType,
            }
            : { description: item.description,
              amount: item.amount,
              type: item.type },
        );
        await updateIncomeItems(id, updatedIncomeItems);
        snackbar.success({ title: "Income updated!",
          description: "Income item has been updated successfully." });
      } else {
        await addIncomeItem(id, {
          description: incomeItemForm.description,
          amount: Number(incomeItemForm.amount),
          type: incomeItemForm.type as IncomeType,
        });
        snackbar.success({ title: "Income added!",
          description: "Income item has been added successfully." });
      }
      handleCloseModal();
    } catch (error) {
      snackbar.error({
        title: isEditMode ? "Failed to update income" : "Failed to add income",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const handleRemoveIncomeItem = async (itemId: string) => {
    if (!id) { return; }
    try {
      await deleteIncomeItem(id, itemId);
      snackbar.success({ title: "Income removed",
        description: "Income item has been removed." });
    } catch (error) {
      snackbar.error({
        title: "Failed to remove income",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Income Management"
        description={`${MONTHS[currentBudget.month]} ${currentBudget.year}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/budget/${id}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleOpenAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Income
            </Button>
          </div>
        }
      />

      {/* Total Income */}
      <Stat label="Total Income" value={totalIncome} currency={CURRENCY} tone="income" />

      {/* Income Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Income Sources</CardTitle>
          <CardDescription>Manage your income items for this budget period</CardDescription>
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
            items={table.pageItems}
            tone="income"
            currency={CURRENCY}
            currentPage={table.currentPage}
            totalPages={table.totalPages}
            totalItems={table.totalItems}
            itemsPerPage={table.itemsPerPage}
            hasActiveFilters={table.hasActiveFilters}
            emptyLabel="No income items yet"
            onEdit={handleOpenEditModal}
            onRemove={handleRemoveIncomeItem}
            onNextPage={table.nextPage}
            onPreviousPage={table.prevPage}
            onItemsPerPageChange={table.setItemsPerPage}
            onClearFilters={table.clearFilters}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Income Modal */}
      <IncomeModal
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        formData={incomeItemForm}
        onClose={handleCloseModal}
        onChange={handleFormChange}
        onSave={handleSaveIncomeItem}
      />
    </div>
  );
}
