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

interface IncomeItem {
  id: number;
  description: string;
  amount: number;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function BudgetIncome() {
  const { id } = useParams();
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  // Mock data - In production, this would come from an API/context
  const [ incomeItems, setIncomeItems ] = useState<IncomeItem[]>([
    { id: 1,
      description: "Salary",
      amount: 35000 },
    { id: 2,
      description: "Freelance",
      amount: 8000 },
  ]);

  const [ isModalOpen, setIsModalOpen ] = useState(false);
  const [ newIncomeItem, setNewIncomeItem ] = useState({ description: "",
    amount: "" });

  // Mock budget info
  const budgetMonth = 11;
  const budgetYear = 2025;

  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);

  const handleAddIncomeItem = () => {
    if (!newIncomeItem.description || !newIncomeItem.amount) {
      snackbar.warning({
        title: "Missing fields",
        description: "Please fill in description and amount.",
      });
      return;
    }

    const newItem: IncomeItem = {
      id: incomeItems.length + 1,
      description: newIncomeItem.description,
      amount: Number(newIncomeItem.amount),
    };

    setIncomeItems([ ...incomeItems, newItem ]);
    setNewIncomeItem({ description: "",
      amount: "" });
    setIsModalOpen(false);

    snackbar.success({
      title: "Income added!",
      description: "Income item has been added successfully.",
    });
  };

  const handleRemoveIncomeItem = (itemId: number) => {
    setIncomeItems(incomeItems.filter((item) => item.id !== itemId));

    snackbar.success({
      title: "Income removed",
      description: "Income item has been removed.",
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
          <h2 className="text-3xl font-bold">Income Management</h2>
          <p className="text-muted-foreground">
            {MONTHS[budgetMonth]} {budgetYear}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
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
            {incomeItems.length} income {incomeItems.length === 1 ? "source" : "sources"}
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
          {incomeItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomeItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-right text-green-600 dark:text-green-400 font-semibold">
                      ${item.amount.toLocaleString("es-MX")} MXN
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveIncomeItem(item.id)}
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
              No income items yet. Add your first income source above.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Income Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Income Item">
        <div className="px-6 pb-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Add a new income source to your budget.
          </p>

          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Salary, Freelance, Investment"
                value={newIncomeItem.description}
                onChange={(e) => setNewIncomeItem({ ...newIncomeItem,
                  description: e.target.value })}
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="amount">Amount (MXN)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={newIncomeItem.amount}
                onChange={(e) => setNewIncomeItem({ ...newIncomeItem,
                  amount: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddIncomeItem} className="flex-1">
              Add Income
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
