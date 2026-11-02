import { TrendingDown, TrendingUp } from "lucide-react";

import {
  BentoGrid,
  BentoItem,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Money,
  Skeleton,
} from "@/components/ui";
import type { ProfileProgress } from "@/features/profile/model/progress";

const CURRENCY = "MXN";

export interface LifetimeTotalsProps {
  progress: ProfileProgress;
  loading: boolean;
}

// TODO(i18n)
export const LifetimeTotals = ({ progress: p, loading }: LifetimeTotalsProps) => (
  <BentoGrid>
    <BentoItem span={6}>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp aria-hidden="true" className="h-4 w-4 text-savings" />
            Total Savings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <Money value={p.totalSavings} currency={CURRENCY} tone="income" size="lg" />
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {p.totalTransactions === null
              ? "Lifetime balance"
              : `${p.totalTransactions} transactions recorded`}
          </p>
        </CardContent>
      </Card>
    </BentoItem>
    <BentoItem span={6}>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <TrendingDown aria-hidden="true" className="h-4 w-4 text-expense" />
            Total Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <Money value={p.totalExpenses} currency={CURRENCY} tone="expense" size="lg" />
          )}
          <p className="mt-1 text-xs text-muted-foreground">Lifetime spending</p>
        </CardContent>
      </Card>
    </BentoItem>
  </BentoGrid>
);
