"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSnackbar, useBudget, useMounted } from "@/hooks";
import { budgetService } from "@/services/budget.service";
import { MONTHS } from "@/types/budget";
import type { IncomeType, IncomeItem } from "@/types/budget";

import { IncomeModal } from "./components/IncomeModal";
import { IncomeTable } from "./components/IncomeTable";

export default function BudgetIncome() {
  const { id } = useParams();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const {
    currentBudget,
    isLoading,
    fetchBudgetById,
    addIncomeItem,
    updateIncomeItems,
    deleteIncomeItem,
    fetchIncomeItemsPaginated,
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

  // Pagination state
  const [ incomeItems, setIncomeItems ] = useState<IncomeItem[]>([]);
  const [ currentPage, setCurrentPage ] = useState(1);
  const [ totalPages, setTotalPages ] = useState(1);
  const [ totalItems, setTotalItems ] = useState(0);
  const itemsPerPage = 5;

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

  const { isMounted, cleanup } = useMounted();

  // Load paginated income items - optimized to prevent excessive requests
  useEffect(() => {
    if (!id || !currentBudget) { return; }

    const loadItems = async () => {
      try {
        const data = await fetchIncomeItemsPaginated(id, {
          page: currentPage,
          limit: itemsPerPage,
        });

        if (isMounted()) {
          setIncomeItems(data.items);
          setTotalPages(data.pagination.pages);
          setTotalItems(data.pagination.total);
        }
      } catch (error) {
        if (isMounted()) {
          snackbar.error({
            title: "Failed to load income items",
            description: error instanceof Error ? error.message : "An error occurred",
          });
        }
      }
    };

    loadItems();

    return cleanup;
  }, [ id, currentBudget, currentPage, isMounted, cleanup ]);

  // Helper function for manual reload (used after CRUD operations)
  const loadIncomeItems = async () => {
    if (!id) { return; }

    try {
      const data = await fetchIncomeItemsPaginated(id, {
        page: currentPage,
        limit: itemsPerPage,
      });
      setIncomeItems(data.items);
      setTotalPages(data.pagination.pages);
      setTotalItems(data.pagination.total);
    } catch (error) {
      snackbar.error({
        title: "Failed to load income items",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

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
          if (item.id === editingItemId) {
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
      // Reload paginated data
      await loadIncomeItems();
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

      // Reload paginated data
      await loadIncomeItems();
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
          <div className="text-3xl font-bold text-income">
            ${totalIncome.toLocaleString("es-MX")} MXN
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {totalItems} income {totalItems === 1 ? "source" : "sources"}
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
          <IncomeTable
            incomeItems={incomeItems}
            isLoading={false}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onEdit={handleOpenEditModal}
            onRemove={handleRemoveIncomeItem}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
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
