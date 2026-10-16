import { CalendarPlus, Eye } from "lucide-react";
import { Link } from "react-router";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Money,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import {
  calculateBudgetTotals,
  sortBudgetsByPeriodDesc,
} from "@/features/budget/model/budget-totals";
import { BUDGET_CURRENCY, periodLabel } from "@/features/budget/model/period";
import type { Budget } from "@/types/budget";

export interface MonthlyBudgetTableProps {
  budgets: Budget[];
  onCreate: () => void;
}

// TODO(i18n)
export const MonthlyBudgetTable = ({ budgets, onCreate }: MonthlyBudgetTableProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Monthly Budgets</CardTitle>
      <CardDescription>Track your income and expenses by month</CardDescription>
    </CardHeader>
    <CardContent>
      {budgets.length === 0 ? (
        <EmptyState
          icon={<CalendarPlus size={20} />}
          title="No budgets yet"
          description="Create a budget for a month to start planning income and expenses."
          action={<Button onClick={onCreate}>Create Budget</Button>}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">Income</TableHead>
              <TableHead className="text-right">Expenses</TableHead>
              <TableHead className="text-right">Savings</TableHead>
              <TableHead className="text-right">Savings Rate</TableHead>
              <TableHead className="w-24">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortBudgetsByPeriodDesc(budgets).map((budget) => {
              const { totalIncome, totalExpense, savings, savingsRate } =
                calculateBudgetTotals(budget);
              const label = periodLabel(budget);
              return (
                <TableRow key={budget.id}>
                  <TableCell className="font-medium">{label}</TableCell>
                  <TableCell className="text-right">
                    <Money value={totalIncome} currency={BUDGET_CURRENCY} tone="income" size="sm" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Money
                      value={totalExpense}
                      currency={BUDGET_CURRENCY}
                      tone="expense"
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Money
                      value={savings}
                      currency={BUDGET_CURRENCY}
                      tone="auto"
                      signed
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm tabular-nums">{savingsRate.toFixed(1)}%</span>
                      <Progress
                        value={Math.max(0, Math.min(100, savingsRate))}
                        className="w-20"
                        aria-label={`${label} savings rate`}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/budget/${budget.id}`} aria-label={`View ${label}`}>
                        <Eye aria-hidden="true" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </CardContent>
  </Card>
);
