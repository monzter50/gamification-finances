"use client";

import { Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/Modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSnackbar, useBudget } from "@/hooks";
import { budgetService } from "@/services/budget.service";
import type { Budget } from "@/types/budget";
import { MONTHS } from "@/types/budget";

import { MonthlyBudgetTable } from "./components/MonthlyBudgetTable";
import { YearlySummary } from "./components/YearlySummary";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();

export default function BudgetList() {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { budgets, fetchBudgets, createBudget } = useBudget();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    year: currentYear.toString(),
    month: currentMonth.toString(),
  });
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchBudgets().catch((error) => {
        snackbar.error({
          title: "Failed to load budgets",
          description: error instanceof Error ? error.message : "An error occurred",
        });
      });
    }
  }, [fetchBudgets, snackbar]);

  const handleCreateBudget = async () => {
    // Check if budget already exists
    const exists = budgets.some(
      (b) => b.year === Number(newBudget.year) && b.month === Number(newBudget.month)
    );

    if (exists) {
      snackbar.warning({
        title: "Budget already exists",
        description: "A budget for this month and year already exists.",
      });
      return;
    }

    try {
      await createBudget({
        year: Number(newBudget.year),
        month: Number(newBudget.month),
      });

      setIsCreateModalOpen(false);

      // Reset form
      setNewBudget({
        year: currentYear.toString(),
        month: currentMonth.toString(),
      });

      snackbar.success({
        title: "Budget created!",
        description: `Budget for ${MONTHS[Number(newBudget.month)]} ${newBudget.year} has been created.`,
      });
    } catch (error) {
      snackbar.error({
        title: "Failed to create budget",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const handleViewBudget = (budgetId: string) => {
    navigate(`/budget/${budgetId}`);
  };

  // Calculate totals for a budget
  const calculateBudgetTotals = (budget: Budget) => {
    return budgetService.calculateTotals(budget);
  };
  // Calculate yearly totals
  const yearlyBudgets = budgets.reduce(
    (acc, budget) => {
      if (!acc[budget.year]) {
        acc[budget.year] = {
          income: 0,
          expense: 0,
          savings: 0
        };
      }
      const { totalIncome, totalExpense } = calculateBudgetTotals(budget);
      acc[budget.year].income += totalIncome;
      acc[budget.year].expense += totalExpense;
      acc[budget.year].savings = acc[budget.year].income - acc[budget.year].expense;
      return acc;
    },
    {} as Record<number, { income: number; expense: number; savings: number }>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Budget Manager</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Budget
        </Button>
      </div>

      {/* Yearly Summary */}
      <YearlySummary yearlyBudgets={yearlyBudgets} />

      {/* Monthly Budgets Table */}
      <MonthlyBudgetTable budgets={budgets} onViewBudget={handleViewBudget} />

      {/* Create Budget Modal */}
      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Budget">
        <div className="px-6 pb-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Create a budget for a specific month and year. You can add income and expense items after creation.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="year">Year</Label>
              <Select value={newBudget.year} onValueChange={(value) => setNewBudget({
                ...newBudget,
                year: value
              })}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="month">Month</Label>
              <Select value={newBudget.month} onValueChange={(value) => setNewBudget({
                ...newBudget,
                month: value
              })}>
                <SelectTrigger id="month">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCreateBudget} className="flex-1">
              Create Budget
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
