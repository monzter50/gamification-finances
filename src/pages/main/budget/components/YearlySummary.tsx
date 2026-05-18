import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface YearlyData {
    income: number;
    expense: number;
    savings: number;
}

interface YearlySummaryProps {
    yearlyBudgets: Record<number, YearlyData>;
}

export function YearlySummary({ yearlyBudgets }: YearlySummaryProps) {
  return (
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
                  <span className="font-medium text-income">
                                        ${data.income.toLocaleString("es-MX")} MXN
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Total Expenses</span>
                  <span className="font-medium text-expense">
                                        ${data.expense.toLocaleString("es-MX")} MXN
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold">Net Savings</span>
                  <span
                    className={`font-bold ${data.savings >= 0
                      ? "text-income"
                      : "text-expense"
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
  );
}
