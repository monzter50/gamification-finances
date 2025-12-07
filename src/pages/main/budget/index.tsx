"use client";

import { Plus, Eye } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/Modal";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSnackbar } from "@/hooks";

interface IncomeItem {
  id: number;
  description: string;
  amount: number;
}

interface ExpenseItem {
  id: number;
  description: string;
  amount: number;
}

interface Budget {
  id: number;
  year: number;
  month: number;
  incomeItems: IncomeItem[];
  expenseItems: ExpenseItem[];
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();

// Mock data - In production, this would come from an API/context
const INITIAL_BUDGETS: Budget[] = [
  {
    id: 1,
    year: currentYear,
    month: currentMonth,
    incomeItems: [
      { id: 1,
        description: "Salary",
        amount: 35000 },
      { id: 2,
        description: "Freelance",
        amount: 8000 },
    ],
    expenseItems: [
      { id: 1,
        description: "Rent",
        amount: 12000 },
      { id: 2,
        description: "Groceries",
        amount: 5000 },
      { id: 3,
        description: "Transportation",
        amount: 2000 },
    ],
  },
];

export default function BudgetList() {
  const navigate = useNavigate();
  const [ budgets, setBudgets ] = useState<Budget[]>(INITIAL_BUDGETS);
  const [ isCreateModalOpen, setIsCreateModalOpen ] = useState(false);
  const [ newBudget, setNewBudget ] = useState({
    year: currentYear.toString(),
    month: currentMonth.toString(),
  });

  const snackbar = useSnackbar();

  const handleCreateBudget = () => {
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

    // Create empty budget
    const newBudgetData: Budget = {
      id: budgets.length + 1,
      year: Number(newBudget.year),
      month: Number(newBudget.month),
      incomeItems: [],
      expenseItems: [],
    };

    setBudgets([ ...budgets, newBudgetData ]);
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
  };

  const handleViewBudget = (budgetId: number) => {
    navigate(`/budget/${budgetId}`);
  };

  // Calculate totals for a budget
  const calculateBudgetTotals = (budget: Budget) => {
    const totalIncome = budget.incomeItems.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = budget.expenseItems.reduce((sum, item) => sum + item.amount, 0);
    const savings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
    return { totalIncome,
      totalExpense,
      savings,
      savingsRate };
  };

  // Calculate yearly totals
  const yearlyBudgets = budgets.reduce(
    (acc, budget) => {
      if (!acc[budget.year]) {
        acc[budget.year] = { income: 0,
          expense: 0,
          savings: 0 };
      }
      const { totalIncome, totalExpense } = calculateBudgetTotals(budget);
      acc[budget.year].income += totalIncome;
      acc[budget.year].expense += totalExpense;
      acc[budget.year].savings = acc[budget.year].income - acc[budget.year].expense;
      return acc;
    },
    {} as Record<number, { income: number; expense: number; savings: number }>
  );

  // Sort budgets by year and month (most recent first)
  const sortedBudgets = [ ...budgets ].sort((a, b) => {
    if (a.year !== b.year) { return b.year - a.year; }
    return b.month - a.month;
  });

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
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(yearlyBudgets)
          .sort(([ a ], [ b ]) => Number(b) - Number(a))
          .map(([ year, data ]) => (
            <Card key={year}>
              <CardHeader>
                <CardTitle>{year} Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Total Income</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      ${data.income.toLocaleString("es-MX")} MXN
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Total Expenses</span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      ${data.expense.toLocaleString("es-MX")} MXN
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">Net Savings</span>
                    <span
                      className={`font-bold ${
                        data.savings >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      ${data.savings.toLocaleString("es-MX")} MXN
                    </span>
                  </div>
                  <Progress
                    value={data.income > 0 ? ((data.income - data.expense) / data.income) * 100 : 0}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Monthly Budgets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Budgets</CardTitle>
          <CardDescription>Track your income and expenses by month</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Income</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead className="text-right">Savings</TableHead>
                <TableHead className="text-right">Savings Rate</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBudgets.map((budget) => {
                const { totalIncome, totalExpense, savings, savingsRate } = calculateBudgetTotals(budget);

                return (
                  <TableRow key={budget.id}>
                    <TableCell className="font-medium">
                      {MONTHS[budget.month]} {budget.year}
                    </TableCell>
                    <TableCell className="text-right text-green-600 dark:text-green-400">
                      ${totalIncome.toLocaleString("es-MX")} MXN
                    </TableCell>
                    <TableCell className="text-right text-red-600 dark:text-red-400">
                      ${totalExpense.toLocaleString("es-MX")} MXN
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        savings >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      ${savings.toLocaleString("es-MX")} MXN
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm">{savingsRate.toFixed(1)}%</span>
                        <Progress value={Math.max(0, Math.min(100, savingsRate))} className="w-20" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => handleViewBudget(budget.id)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {sortedBudgets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No budgets created yet. Create your first budget above!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Budget Modal */}
      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Budget">
        <div className="px-6 pb-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Create a budget for a specific month and year. You can add income and expense items after creation.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="year">Year</Label>
              <Select value={newBudget.year} onValueChange={(value) => setNewBudget({ ...newBudget,
                year: value })}>
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
              <Select value={newBudget.month} onValueChange={(value) => setNewBudget({ ...newBudget,
                month: value })}>
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
