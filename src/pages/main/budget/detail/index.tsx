"use client";

import { ArrowLeft, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data - In production, this would come from an API/context
const MOCK_BUDGET = {
  id: 1,
  year: 2025,
  month: 11,
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
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function BudgetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // In production, fetch budget by id
  const budget = MOCK_BUDGET;

  const totalIncome = budget.incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = budget.expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/budget")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold">
            {MONTHS[budget.month]} {budget.year}
          </h2>
          <p className="text-muted-foreground">Budget Overview</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${totalIncome.toLocaleString("es-MX")} MXN
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {budget.incomeItems.length} items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              ${totalExpense.toLocaleString("es-MX")} MXN
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {budget.expenseItems.length} items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Net Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                savings >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              ${savings.toLocaleString("es-MX")} MXN
            </div>
            <p className="text-xs text-muted-foreground mt-1">{savingsRate.toFixed(1)}% savings rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card
          className="cursor-pointer hover:border-green-500 transition-colors"
          onClick={() => navigate(`/budget/${id}/income`)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Income Management
            </CardTitle>
            <CardDescription>
              Manage your income sources and track your earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Current Income</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${totalIncome.toLocaleString("es-MX")} MXN
                </p>
              </div>
              <Button variant="ghost">View Details →</Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-red-500 transition-colors"
          onClick={() => navigate(`/budget/${id}/expense`)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Expense Management
            </CardTitle>
            <CardDescription>
              Track and manage your monthly expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Current Expenses</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ${totalExpense.toLocaleString("es-MX")} MXN
                </p>
              </div>
              <Button variant="ghost">View Details →</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
