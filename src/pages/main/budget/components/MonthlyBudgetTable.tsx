import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Budget } from "@/types/budget";
import { MONTHS } from "@/types/budget";
import { calculateBudgetTotals } from "@/utils";

interface MonthlyBudgetTableProps {
    budgets: Budget[];
    onViewBudget: (budgetId: string) => void;
}

export function MonthlyBudgetTable({ budgets, onViewBudget }: MonthlyBudgetTableProps) {
  const sortedBudgets = [ ...budgets ].sort((a, b) => {
    if (a.year !== b.year) { return b.year - a.year; }
    return b.month - a.month;
  });

  return (
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
                <TableRow key={`${budget.id}-${budget.month}-${budget.year}`}>
                  <TableCell className="font-medium">
                    {MONTHS[budget.month]} {budget.year}
                  </TableCell>
                  <TableCell className="text-right text-income">
                                        ${totalIncome.toLocaleString("es-MX")} MXN
                  </TableCell>
                  <TableCell className="text-right text-expense">
                                        ${totalExpense.toLocaleString("es-MX")} MXN
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${savings >= 0 ? "text-income" : "text-expense"
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
                    <Button size="sm" variant="outline" onClick={() => onViewBudget(budget.id)}>
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
  );
}
