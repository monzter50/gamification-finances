import { Stat } from "@/components/ui";
import { useTransactionSummary } from "@/features/transactions/api/transactionQueries";
import { ErrorPanel } from "@/shared/errors";

const CURRENCY = "MXN";

// TODO(i18n)
/** All-time income / expenses / net balance across every transaction. */
export const TransactionSummaryStats = () => {
  const { data: summary, isPending, isError, error, refetch } = useTransactionSummary();

  if (isError) {
    return (
      <ErrorPanel
        error={error}
        size="compact"
        title="Couldn't load totals"
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="grid gap-gutter md:grid-cols-3">
      <Stat
        label="Total Income"
        value={summary?.totalIncome ?? 0}
        currency={CURRENCY}
        tone="income"
        loading={isPending}
      />
      <Stat
        label="Total Expenses"
        value={summary?.totalExpense ?? 0}
        currency={CURRENCY}
        tone="expense"
        loading={isPending}
      />
      <Stat
        label="Net Balance"
        value={summary?.netBalance ?? 0}
        currency={CURRENCY}
        tone="auto"
        loading={isPending}
      />
    </div>
  );
};
