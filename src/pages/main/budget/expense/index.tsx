"use client";

import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/Modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSnackbar } from "@/hooks";

interface ExpenseItem {
  id: number;
  description: string;
  amount: number;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function BudgetExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  // Mock data - In production, this would come from an API/context
  const [ expenseItems, setExpenseItems ] = useState<ExpenseItem[]>([
    { id: 1,
      description: "Rent",
      amount: 12000 },
    { id: 2,
      description: "Groceries",
      amount: 5000 },
    { id: 3,
      description: "Transportation",
      amount: 2000 },
  ]);

  const [ isModalOpen, setIsModalOpen ] = useState(false);
  const [ newExpenseItem, setNewExpenseItem ] = useState({ description: "",
    amount: "" });

  // Mock budget info
  const budgetMonth = 11;
  const budgetYear = 2025;

  const totalExpense = expenseItems.reduce((sum, item) => sum + item.amount, 0);

  const handleAddExpenseItem = () => {
    if (!newExpenseItem.description || !newExpenseItem.amount) {
      snackbar.warning({
        title: "Missing fields",
        description: "Please fill in description and amount.",
      });
      return;
    }

    const newItem: ExpenseItem = {
      id: expenseItems.length + 1,
      description: newExpenseItem.description,
      amount: Number(newExpenseItem.amount),
    };

    setExpenseItems([ ...expenseItems, newItem ]);
    setNewExpenseItem({ description: "",
      amount: "" });
    setIsModalOpen(false);

    snackbar.success({
      title: "Expense added!",
      description: "Expense item has been added successfully.",
    });
  };

  const handleRemoveExpenseItem = (itemId: number) => {
    setExpenseItems(expenseItems.filter((item) => item.id !== itemId));

    snackbar.success({
      title: "Expense removed",
      description: "Expense item has been removed.",
    });
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
            {MONTHS[budgetMonth]} {budgetYear}
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
        <CardContent>
          {expenseItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-right text-red-600 dark:text-red-400 font-semibold">
                      ${item.amount.toLocaleString("es-MX")} MXN
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveExpenseItem(item.id)}
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
