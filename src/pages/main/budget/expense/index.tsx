"use client";

import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/Modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSnackbar, useBudget } from "@/hooks";
import { budgetService } from "@/services/budget.service";
import { MONTHS } from "@/types/budget";

export default function BudgetExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { currentBudget, isLoading, fetchBudgetById, addExpenseItem, deleteExpenseItem } = useBudget();
  const hasFetched = useRef(false);

  const [ isModalOpen, setIsModalOpen ] = useState(false);
  const [ newExpenseItem, setNewExpenseItem ] = useState({
    description: "",
    amount: "",
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

  const { totalExpense } = budgetService.calculateTotals(currentBudget);

  const handleAddExpenseItem = async () => {
    if (!newExpenseItem.description || !newExpenseItem.amount || !id) {
      snackbar.warning({
        title: "Missing fields",
        description: "Please fill in description and amount.",
      });
      return;
    }

    try {
      await addExpenseItem(id, {
        description: newExpenseItem.description,
        amount: Number(newExpenseItem.amount),
      });

      setNewExpenseItem({ description: "",
        amount: "" });
      setIsModalOpen(false);

      snackbar.success({
        title: "Expense added!",
        description: "Expense item has been added successfully.",
      });
    } catch (error) {
      snackbar.error({
        title: "Failed to add expense",
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
        <Button onClick={() => setIsModalOpen(true)}>
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
            {currentBudget.expenseItems.length} expense {currentBudget.expenseItems.length === 1 ? "item" : "items"}
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
          {currentBudget.expenseItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentBudget.expenseItems.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-right text-red-600 dark:text-red-400 font-semibold">
                      ${item.amount.toLocaleString("es-MX")} MXN
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveExpenseItem(item._id!)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No expense items yet. Add your first expense above.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Expense Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Expense Item">
        <div className="px-6 pb-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Add a new expense to your budget.
          </p>

          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Rent, Groceries, Utilities"
                value={newExpenseItem.description}
                onChange={(e) => setNewExpenseItem({ ...newExpenseItem,
                  description: e.target.value })}
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="amount">Amount (MXN)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={newExpenseItem.amount}
                onChange={(e) => setNewExpenseItem({ ...newExpenseItem,
                  amount: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddExpenseItem} className="flex-1">
              Add Expense
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
