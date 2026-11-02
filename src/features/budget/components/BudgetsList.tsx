import { Skeleton } from "@/components/ui";
import { useBudgetsList } from "@/features/budget/api/budgetQueries";
import { MonthlyBudgetTable } from "@/features/budget/components/MonthlyBudgetTable";
import { YearlySummary } from "@/features/budget/components/YearlySummary";
import { ErrorPanel } from "@/shared/errors";

export interface BudgetsListProps {
  onCreate: () => void;
}

/** Loads all budgets and renders the yearly summary + monthly table. */
export const BudgetsList = ({ onCreate }: BudgetsListProps) => {
  const { data: budgets, isPending, isError, error, refetch } = useBudgetsList();

  if (isPending) {
    return (
      <div className="space-y-stack" aria-busy="true">
        <div className="grid gap-gutter md:grid-cols-3">
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorPanel error={error} title="Couldn't load budgets" onRetry={() => void refetch()} />
    );
  }

  return (
    <>
      <YearlySummary budgets={budgets} />
      <MonthlyBudgetTable budgets={budgets} onCreate={onCreate} />
    </>
  );
};
