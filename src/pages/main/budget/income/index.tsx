"use client";

import { ArrowLeft, Plus, Trash2, Pencil } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSnackbar, useBudget } from "@/hooks";
import { budgetService } from "@/services/budget.service";
import { MONTHS } from "@/types/budget";
import type { IncomeType } from "@/types/budget";

import { IncomeModal } from "./components/IncomeModal";

export default function BudgetIncome() {
  const { id } = useParams();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { currentBudget, isLoading, fetchBudgetById, addIncomeItem, updateIncomeItems, deleteIncomeItem } = useBudget();
  const hasFetched = useRef(false);

  const [ isModalOpen, setIsModalOpen ] = useState(false);
  const [ isEditMode, setIsEditMode ] = useState(false);
  const [ editingItemId, setEditingItemId ] = useState<string | null>(null);
  const [ incomeItemForm, setIncomeItemForm ] = useState({
    description: "",
    amount: "",
    type: "" as IncomeType | "",
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

  if (isLoading || !currentBudget) {
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

  const handleOpenEditModal = (itemId: string, description: string, amount: number, type: IncomeType) => {
    setIsEditMode(true);
    setEditingItemId(itemId);
    setIncomeItemForm({
      description,
      amount: amount.toString(),
      type,
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
        // Update existing item by sending the entire array
        const updatedIncomeItems = currentBudget.incomeItems.map((item) => {
          if (item._id === editingItemId) {
            return {
              description: incomeItemForm.description,
              amount: Number(incomeItemForm.amount),
              type: incomeItemForm.type as IncomeType,
            };
          }
          return {
            description: item.description,
            amount: item.amount,
            type: item.type,
          };
        });

        await updateIncomeItems(id, updatedIncomeItems);

        snackbar.success({
          title: "Income updated!",
          description: "Income item has been updated successfully.",
        });
      } else {
        // Add new item
        await addIncomeItem(id, {
          description: incomeItemForm.description,
          amount: Number(incomeItemForm.amount),
          type: incomeItemForm.type as IncomeType,
        });

        snackbar.success({
          title: "Income added!",
          description: "Income item has been added successfully.",
        });
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

      snackbar.success({
        title: "Income removed",
        description: "Income item has been removed.",
      });
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
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(`/budget/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold">Income Management</h2>
          <p className="text-muted-foreground">
            {MONTHS[currentBudget.month]} {currentBudget.year}
          </p>
        </div>
        <Button onClick={handleOpenAddModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add Income
        </Button>
      </div>

      {/* Total Income Card */}
      <Card>
        <CardHeader>
          <CardTitle>Total Income</CardTitle>
          <CardDescription>Sum of all income sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            ${totalIncome.toLocaleString("es-MX")} MXN
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {currentBudget.incomeItems.length} income {currentBudget.incomeItems.length === 1 ? "source" : "sources"}
          </p>
        </CardContent>
      </Card>

      {/* Income Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Income Sources</CardTitle>
          <CardDescription>Manage your income items for this budget period</CardDescription>
        </CardHeader>
        <CardContent>
          {currentBudget.incomeItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentBudget.incomeItems.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {item.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-green-600 dark:text-green-400 font-semibold">
                      ${item.amount.toLocaleString("es-MX")} MXN
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEditModal(item._id!, item.description, item.amount, item.type)}
                        >
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveIncomeItem(item._id!)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No income items yet. Add your first income source above.
            </div>
          )}
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
