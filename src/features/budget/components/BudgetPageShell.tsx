import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { Button, PageHeader, Skeleton } from "@/components/ui";
import { useBudgetDetail } from "@/features/budget/api/budgetQueries";
import { periodLabel } from "@/features/budget/model/period";
import { ErrorPanel } from "@/shared/errors";
import type { Budget } from "@/types/budget";

export interface BudgetPageShellProps {
  budgetId: string;
  title: string;
  /** Where "Back" goes. */
  backTo: string;
  /** Extra header actions, rendered before "Back". */
  // eslint-disable-next-line no-unused-vars
  actions?: (budget: Budget) => ReactNode;
  // eslint-disable-next-line no-unused-vars
  children: (budget: Budget) => ReactNode;
}

/**
 * Header + loading / error states shared by every page under /budget/:id.
 * Children render only once the budget is loaded, so they never see `undefined`.
 */
export const BudgetPageShell = ({
  budgetId,
  title,
  backTo,
  actions,
  children,
}: BudgetPageShellProps) => {
  const { data: budget, isPending, isError, error, refetch } = useBudgetDetail(budgetId);

  const back = (
    <Button variant="outline" asChild>
      <Link to={backTo}>
        <ArrowLeft aria-hidden="true" />
        Back
      </Link>
    </Button>
  );

  return (
    <div className="space-y-stack">
      <PageHeader
        title={title}
        description={budget ? periodLabel(budget) : undefined}
        actions={
          <>
            {budget && actions?.(budget)}
            {back}
          </>
        }
      />
      {isPending ? (
        <div className="space-y-stack" aria-busy="true">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : isError ? (
        <ErrorPanel error={error} title="Couldn't load budget" onRetry={() => void refetch()} />
      ) : (
        children(budget)
      )}
    </div>
  );
};
