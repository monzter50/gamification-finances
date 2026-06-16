"use client";

import { ArrowLeft, Copy, DollarSign, Receipt, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBudget, useSnackbar } from "@/hooks";
import { MONTHS } from "@/types/budget";
import { calculateBudgetTotals } from "@/utils";

import { DuplicateBudgetModal } from "./components/DuplicateBudgetModal";

export default function BudgetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { currentBudget, isLoading, fetchBudgetById } = useBudget();
  const hasFetched = useRef(false);
  const [showDuplicate, setShowDuplicate] = useState(false);

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
  }, [id, fetchBudgetById, snackbar, navigate]);

  if (isLoading || !currentBudget) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading budget...</p>
      </div>
    );
  }

  const { totalIncome, totalExpense, savings, savingsRate } = calculateBudgetTotals(currentBudget);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/budget")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold">
            {MONTHS[currentBudget.month]} {currentBudget.year}
          </h2>
          <p className="text-muted-foreground">Budget Overview</p>
        </div>
        <Button variant="outline" onClick={() => setShowDuplicate(true)}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </Button>
      </div>

      <DuplicateBudgetModal
        open={showDuplicate}
        sourceBudget={currentBudget}
        onClose={() => setShowDuplicate(false)}
        onDuplicated={(created) => navigate(`/budget/${created.id}`)}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-income" />
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-income">
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
              <TrendingDown className="h-4 w-4 text-expense" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-expense">
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
            <div className={`text-2xl font-bold ${savings >= 0 ? "text-income" : "text-expense"}`}>
              ${savings.toLocaleString("es-MX")} MXN
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {savingsRate.toFixed(1)}% savings rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card
          className="cursor-pointer hover:border-income transition-colors"
          onClick={() => navigate(`/budget/${id}/income`)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-income" />
              Income Management
            </CardTitle>
            <CardDescription>Manage your income sources and track your earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Current Income</p>
                <p className="text-2xl font-bold text-income">
                  ${totalIncome.toLocaleString("es-MX")} MXN
                </p>
              </div>
              <Button variant="ghost">View Details →</Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-expense transition-colors"
          onClick={() => navigate(`/budget/${id}/expense`)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-expense" />
              Expense Management
            </CardTitle>
            <CardDescription>Track and manage your monthly expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Current Expenses</p>
                <p className="text-2xl font-bold text-expense">
                  ${totalExpense.toLocaleString("es-MX")} MXN
                </p>
              </div>
              <Button variant="ghost">View Details →</Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-info transition-colors"
          onClick={() => navigate(`/budget/${id}/transactions`)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-info" />
              Transaction Tracking
            </CardTitle>
            <CardDescription>Track all your financial transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Track & Manage</p>
                <p className="text-lg font-semibold text-info">All Transactions</p>
              </div>
              <Button variant="ghost">View Details →</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
