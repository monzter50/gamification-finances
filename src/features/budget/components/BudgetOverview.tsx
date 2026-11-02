import { ChevronRight, Receipt, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { Card, CardDescription, CardHeader, CardTitle, Stat } from "@/components/ui";
import { calculateBudgetTotals } from "@/features/budget/model/budget-totals";
import { BUDGET_CURRENCY } from "@/features/budget/model/period";
import { cn } from "@/lib/utils";
import type { Budget } from "@/types/budget";

interface SectionLinkProps {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
  hoverBorder: string;
}

const SectionLink = ({ to, icon, title, description, hoverBorder }: SectionLinkProps) => (
  <Link
    to={to}
    className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <Card className={cn("h-full transition-colors duration-fast ease-standard", hoverBorder)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
          <ChevronRight
            aria-hidden="true"
            className="ml-auto h-4 w-4 text-muted-foreground transition-transform duration-fast group-hover:translate-x-0.5"
          />
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  </Link>
);

export interface BudgetOverviewProps {
  budget: Budget;
}

// TODO(i18n)
/** Planned totals for one budget + links to its income, expense and transactions pages. */
export const BudgetOverview = ({ budget }: BudgetOverviewProps) => {
  const { totalIncome, totalExpense, savings } = calculateBudgetTotals(budget);
  const base = `/budget/${budget.id}`;

  return (
    <>
      <div className="grid gap-gutter md:grid-cols-3">
        <Stat label="Total Income" value={totalIncome} currency={BUDGET_CURRENCY} tone="income" />
        <Stat
          label="Total Expenses"
          value={totalExpense}
          currency={BUDGET_CURRENCY}
          tone="expense"
        />
        <Stat label="Net Savings" value={savings} currency={BUDGET_CURRENCY} tone="auto" />
      </div>

      <nav aria-label="Budget sections" className="grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
        <SectionLink
          to={`${base}/income`}
          icon={<TrendingUp aria-hidden="true" className="h-5 w-5 text-income" />}
          title="Income Management"
          description={`${budget.incomeItems.length} planned income items`}
          hoverBorder="group-hover:border-income"
        />
        <SectionLink
          to={`${base}/expense`}
          icon={<TrendingDown aria-hidden="true" className="h-5 w-5 text-expense" />}
          title="Expense Management"
          description={`${budget.expenseItems.length} planned expense items`}
          hoverBorder="group-hover:border-expense"
        />
        <SectionLink
          to={`${base}/transactions`}
          icon={<Receipt aria-hidden="true" className="h-5 w-5 text-info" />}
          title="Transaction Tracking"
          description="Track what actually came in and went out"
          hoverBorder="group-hover:border-info"
        />
      </nav>
    </>
  );
};
