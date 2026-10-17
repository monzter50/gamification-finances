import { useParams } from "react-router";

import { BudgetPageShell, ExpenseItemsSection } from "@/features/budget";

const BudgetExpensePage = () => {
  const { id = "" } = useParams();
  return (
    <BudgetPageShell budgetId={id} title="Expense Management" backTo={`/budget/${id}`}>
      {(budget) => <ExpenseItemsSection budget={budget} />}
    </BudgetPageShell>
  );
};

export default BudgetExpensePage;
