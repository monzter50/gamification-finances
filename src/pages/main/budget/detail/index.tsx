"use client";

import { ArrowLeft, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBudget, useSnackbar } from "@/hooks";
import { budgetService } from "@/services/budget.service";
import { MONTHS } from "@/types/budget";

export default function BudgetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { currentBudget, isLoading, fetchBudgetById } = useBudget();
  const hasFetched = useRef(false);

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

  const { totalIncome, totalExpense, savings, savingsRate } = budgetService.calculateTotals(currentBudget);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/budget")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold">
            {MONTHS[currentBudget.month]} {currentBudget.year}
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
              {currentBudget.incomeItems.length} items
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
              {currentBudget.expenseItems.length} items
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
