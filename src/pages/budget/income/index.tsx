import { useParams } from "react-router";

import { BudgetPageShell, IncomeItemsSection } from "@/features/budget";

const BudgetIncomePage = () => {
  const { id = "" } = useParams();
  return (
    <BudgetPageShell budgetId={id} title="Income Management" backTo={`/budget/${id}`}>
      {(budget) => <IncomeItemsSection budget={budget} />}
    </BudgetPageShell>
  );
};

export default BudgetIncomePage;
