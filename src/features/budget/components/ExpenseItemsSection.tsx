import {
  type AddExpenseItemRequest,
  useAddExpenseItem,
  useDeleteExpenseItem,
  useUpdateExpenseItem,
} from "@/features/budget/api/useBudgetItemMutations";
import { BudgetItemsSection } from "@/features/budget/components/BudgetItemsSection";
import type { BudgetItemPatch } from "@/features/budget/components/BudgetItemsTable";
import { calculateBudgetTotals } from "@/features/budget/model/budget-totals";
import { useSnackbar } from "@/shared/hooks";
import { EXPENSE_TYPES, type Budget, type ExpenseItem, type ExpenseType } from "@/types/budget";

const toRequest = (item: ExpenseItem, patch: BudgetItemPatch = {}): AddExpenseItemRequest => ({
  description: patch.description ?? item.description,
  amount: patch.amount ?? item.amount,
  type: (patch.type ?? item.type) as ExpenseType,
});

export interface ExpenseItemsSectionProps {
  budget: Budget;
}

// TODO(i18n)
export const ExpenseItemsSection = ({ budget }: ExpenseItemsSectionProps) => {
  const snackbar = useSnackbar();
  const add = useAddExpenseItem(budget.id);
  const update = useUpdateExpenseItem(budget.id);
  const remove = useDeleteExpenseItem(budget.id);

  const handleUpdate = async (itemId: string, patch: BudgetItemPatch) => {
    const item = budget.expenseItems.find((i) => i.id === itemId);
    if (!item) return;
    await update.mutateAsync({ itemId, data: toRequest(item, patch) });
  };

  const handleRemove = (itemId: string) =>
    remove.mutate(itemId, {
      onSuccess: () =>
        snackbar.success({
          title: "Expense removed",
          description: "Expense item has been removed.",
        }),
    });

  return (
    <BudgetItemsSection
      kind="expense"
      title="Expense Items"
      statLabel="Total Expenses"
      total={calculateBudgetTotals(budget).totalExpense}
      items={budget.expenseItems}
      typeOptions={EXPENSE_TYPES}
      defaultType="Variable"
      onCreate={({ description, amount, type }) =>
        add.mutateAsync({ description, amount, type: type as ExpenseType })
      }
      onUpdate={handleUpdate}
      onRemove={handleRemove}
    />
  );
};
