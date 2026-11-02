import { Card, CardContent, CardHeader, CardTitle, Money, Progress } from "@/components/ui";
import { summarizeByYear } from "@/features/budget/model/budget-totals";
import { BUDGET_CURRENCY } from "@/features/budget/model/period";
import type { Budget } from "@/types/budget";

export interface YearlySummaryProps {
  budgets: Budget[];
}

// TODO(i18n)
/** One card per year: planned income, expenses and net savings. */
export const YearlySummary = ({ budgets }: YearlySummaryProps) => {
  const years = Object.entries(summarizeByYear(budgets)).sort(([a], [b]) => Number(b) - Number(a));

  return (
    <div className="grid gap-gutter md:grid-cols-3">
      {years.map(([year, totals]) => (
        <Card key={year}>
          <CardHeader>
            <CardTitle>{year} Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Income</span>
              <Money value={totals.income} currency={BUDGET_CURRENCY} tone="income" size="sm" />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Expenses</span>
              <Money value={totals.expense} currency={BUDGET_CURRENCY} tone="expense" size="sm" />
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Net Savings</span>
                <Money
                  value={totals.savings}
                  currency={BUDGET_CURRENCY}
                  tone="auto"
                  signed
                  size="sm"
                />
              </div>
              <Progress
                value={totals.income > 0 ? (totals.savings / totals.income) * 100 : 0}
                className="mt-2"
                aria-label={`${year} savings rate`}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
