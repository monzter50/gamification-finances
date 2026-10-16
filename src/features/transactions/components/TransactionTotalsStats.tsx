import { Stat } from "@/components/ui";
import type { TransactionTotals } from "@/types/api";

const CURRENCY = "MXN";

export interface TransactionTotalsStatsProps {
  totals: TransactionTotals | null;
  loading: boolean;
}

// TODO(i18n)
/** Income / expenses / savings over a filtered set of transactions. */
export const TransactionTotalsStats = ({ totals, loading }: TransactionTotalsStatsProps) => (
  <div className="grid gap-gutter md:grid-cols-3">
    <Stat
      label="Total Income"
      value={totals?.income ?? 0}
      currency={CURRENCY}
      tone="income"
      loading={loading}
    />
    <Stat
      label="Total Expenses"
      value={totals?.expense ?? 0}
      currency={CURRENCY}
      tone="expense"
      loading={loading}
    />
    <Stat
      label="Total Savings"
      value={totals?.savings ?? 0}
      currency={CURRENCY}
      tone="auto"
      loading={loading}
    />
  </div>
);
