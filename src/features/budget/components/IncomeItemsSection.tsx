import { useAccountsList } from "@/features/accounts";
import {
  type AddIncomeItemRequest,
  useAddIncomeItem,
  useDeleteIncomeItem,
  useUpdateIncomeItem,
} from "@/features/budget/api/useBudgetItemMutations";
import { BudgetItemsSection } from "@/features/budget/components/BudgetItemsSection";
import type { BudgetItemPatch } from "@/features/budget/components/BudgetItemsTable";
import { calculateBudgetTotals } from "@/features/budget/model/budget-totals";
import { AppError } from "@/shared/errors";
import { useSnackbar } from "@/shared/hooks";
import type { Account } from "@/types/api";
import { INCOME_TYPES, type Budget, type IncomeItem, type IncomeType } from "@/types/budget";

const NO_ACCOUNTS: Account[] = [];

const toRequest = (item: IncomeItem, patch: BudgetItemPatch = {}): AddIncomeItemRequest => ({
  description: patch.description ?? item.description,
  amount: patch.amount ?? item.amount,
  type: (patch.type ?? item.type) as IncomeType,
  accountId: patch.accountId ?? item.accountId,
});

export interface IncomeItemsSectionProps {
  budget: Budget;
}

// TODO(i18n)
export const IncomeItemsSection = ({ budget }: IncomeItemsSectionProps) => {
  const snackbar = useSnackbar();
  const { data: accounts = NO_ACCOUNTS } = useAccountsList();
  const add = useAddIncomeItem(budget.id);
  const update = useUpdateIncomeItem(budget.id);
  const remove = useDeleteIncomeItem(budget.id);

  const handleUpdate = async (itemId: string, patch: BudgetItemPatch) => {
    const item = budget.incomeItems.find((i) => i.id === itemId);
    if (!item) return;
    const data = toRequest(item, patch);
    // Items created before accounts were required have none, and the API rejects them.
    if (!data.accountId) {
      snackbar.warning({
        title: "Pick an account first",
        description: "This item has no account yet. Set its Account cell, then edit the rest.",
      });
      throw new AppError({ message: "Income item has no account", kind: "validation" });
    }
    await update.mutateAsync({ itemId, data });
  };

  const handleRemove = (itemId: string) =>
    remove.mutate(itemId, {
      onSuccess: () =>
        snackbar.success({ title: "Income removed", description: "Income item has been removed." }),
    });

  return (
    <BudgetItemsSection
      kind="income"
      title="Income Sources"
      statLabel="Total Income"
      total={calculateBudgetTotals(budget).totalIncome}
      items={budget.incomeItems}
      typeOptions={INCOME_TYPES}
      accounts={accounts}
      onCreate={(values) => add.mutateAsync({ ...values, type: values.type as IncomeType })}
      onUpdate={handleUpdate}
      onRemove={handleRemove}
    />
  );
};
