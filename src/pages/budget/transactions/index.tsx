import { useParams } from "react-router";

import { BudgetPageShell } from "@/features/budget";
import {
  TransactionTotalsStats,
  TransactionsPanel,
  defaultDayForBudget,
} from "@/features/transactions";

const PAGE_SIZE = 5;

const BudgetTransactionsPage = () => {
  const { id = "" } = useParams();

  return (
    <BudgetPageShell budgetId={id} title="Transaction Tracking" backTo={`/budget/${id}`}>
      {(budget) => (
        <TransactionsPanel
          title="Transactions"
          filters={{ budgetId: budget.id }}
          pageSize={PAGE_SIZE}
          budgets={[budget]}
          defaultDate={defaultDayForBudget(budget)}
          resolveBudgetId={() => budget.id}
          // Totals come from the API over the whole budget, not just this page.
          renderTotals={(totals, loading) => (
            <TransactionTotalsStats totals={totals} loading={loading} />
          )}
        />
      )}
    </BudgetPageShell>
  );
};

export default BudgetTransactionsPage;
