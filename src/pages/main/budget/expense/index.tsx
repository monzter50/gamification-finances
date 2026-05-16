"use client";

import { ArrowLeft, Plus, Trash2, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSnackbar, useBudget, useMounted } from "@/hooks";
import { budgetService } from "@/services/budget.service";
import { MONTHS } from "@/types/budget";
import type { ExpenseType, ExpenseItem } from "@/types/budget";

import { ExpenseModal } from "./components/ExpenseModal";

export default function BudgetExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const isMounted = useMounted();
  const {
    currentBudget,
    isLoading,
    fetchBudgetById,
    addExpenseItem,
    updateExpenseItems,
    deleteExpenseItem,
    fetchExpenseItemsPaginated,
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

  // Pagination state
  const [ expenseItems, setExpenseItems ] = useState<ExpenseItem[]>([]);
  const [ currentPage, setCurrentPage ] = useState(1);
  const [ totalPages, setTotalPages ] = useState(1);
  const [ totalItems, setTotalItems ] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    if (id && !hasFetched.current && isMounted) {
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

  // Load paginated expense items
  useEffect(() => {
    if (id && currentBudget) {
      loadExpenseItems();
    }
  }, [ id, currentBudget, currentPage ]);

  const loadExpenseItems = async () => {
    if (!id) { return; }

    try {
      const data = await fetchExpenseItemsPaginated(id, {
        page: currentPage,
        limit: itemsPerPage,
      });
      setExpenseItems(data.items);
      setTotalPages(data.pagination.pages);
      setTotalItems(data.pagination.total);
    } catch (error) {
      snackbar.error({
        title: "Failed to load expense items",
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

  const { totalExpense } = budgetService.calculateTotals(currentBudget);

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingItemId(null);
    setExpenseItemForm({
      description: "",
      amount: "",
      type: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (itemId: string, description: string, amount: number, type: ExpenseType) => {
    setIsEditMode(true);
    setEditingItemId(itemId);
    setExpenseItemForm({
      description,
      amount: amount.toString(),
      type,
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (field: "description" | "amount" | "type", value: string) => {
    setExpenseItemForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingItemId(null);
    setExpenseItemForm({
      description: "",
      amount: "",
      type: ""
    });
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
        // Update existing item by sending the entire array
        const updatedExpenseItems = currentBudget.expenseItems.map((item) => {
          if (item.id === editingItemId) {
            return {
              description: expenseItemForm.description,
              amount: Number(expenseItemForm.amount),
              type: expenseItemForm.type as ExpenseType,
            };
          }
          return {
            description: item.description,
            amount: item.amount,
            type: item.type,
          };
        });

        await updateExpenseItems(id, updatedExpenseItems);

        snackbar.success({
          title: "Expense updated!",
          description: "Expense item has been updated successfully.",
        });
      } else {
        // Add new item
        await addExpenseItem(id, {
          description: expenseItemForm.description,
          amount: Number(expenseItemForm.amount),
          type: expenseItemForm.type as ExpenseType,
        });

        snackbar.success({
          title: "Expense added!",
          description: "Expense item has been added successfully.",
        });
      }

      handleCloseModal();
      // Reload paginated data
      await loadExpenseItems();
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

      snackbar.success({
        title: "Expense removed",
        description: "Expense item has been removed.",
      });

      // Reload paginated data
      await loadExpenseItems();
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
          <div className="text-3xl font-bold text-red-600 dark:text-red-400">
            ${totalExpense.toLocaleString("es-MX")} MXN
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {totalItems} expense {totalItems === 1 ? "item" : "items"}
          </p>
        </CardContent>
      </Card>

      {/* Expense Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Items</CardTitle>
          <CardDescription>Manage your expenses for this budget period</CardDescription>
        </CardHeader>
        <CardContent>
          {expenseItems && expenseItems.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${item.type === "Fixed"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                        }`}>
                          {item.type === "Fixed" ? "📌 Fixed" : "💸 Variable"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400 font-semibold">
                        ${item.amount.toLocaleString("es-MX")} MXN
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenEditModal(item.id!, item.description, item.amount, item.type)}
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveExpenseItem(item.id!)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages} ({totalItems} total items)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No expense items yet. Add your first expense above.
            </div>
          )}
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
