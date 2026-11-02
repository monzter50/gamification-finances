import { Card, CardContent, CardDescription, CardHeader, CardTitle, Stat } from "@/components/ui";
import { BudgetItemsFilters } from "@/features/budget/components/BudgetItemsFilters";
import {
  BudgetItemsTable,
  type BudgetItemPatch,
  type BudgetItemRow,
  type BudgetItemValues,
} from "@/features/budget/components/BudgetItemsTable";
import { useBudgetItemsTable } from "@/features/budget/hooks/useBudgetItemsTable";
import { BUDGET_CURRENCY } from "@/features/budget/model/period";
import type { Account } from "@/types/api";

export interface BudgetItemsSectionProps {
  kind: "income" | "expense";
  /** Card heading, e.g. "Income Sources". */
  title: string;
  statLabel: string;
  total: number;
  items: BudgetItemRow[];
  typeOptions: readonly string[];
  defaultType?: string;
  /** Pass to show the account column (income). */
  accounts?: Account[];
  // eslint-disable-next-line no-unused-vars
  onCreate: (values: BudgetItemValues) => Promise<unknown>;
  // eslint-disable-next-line no-unused-vars
  onUpdate: (itemId: string, patch: BudgetItemPatch) => Promise<unknown>;
  // eslint-disable-next-line no-unused-vars
  onRemove: (itemId: string) => void;
}

/**
 * Total + filterable, paginated, inline-editable items table for one side of
 * a budget. Data and mutations come from the caller (Income/ExpenseItemsSection).
 */
export const BudgetItemsSection = ({
  kind,
  title,
  statLabel,
  total,
  items,
  typeOptions,
  defaultType,
  accounts,
  onCreate,
  onUpdate,
  onRemove,
}: BudgetItemsSectionProps) => {
  const table = useBudgetItemsTable(items);

  // Rejections propagate so the "+ New" row keeps the typed values and edited
  // cells roll back; the MutationCache already toasted the error.
  const handleCreate = async (values: BudgetItemValues) => {
    await onCreate(values);
    table.goToLastPage();
  };
  const handleUpdate = async (itemId: string, patch: BudgetItemPatch) => {
    await onUpdate(itemId, patch);
  };

  return (
    <>
      <Stat label={statLabel} value={total} currency={BUDGET_CURRENCY} tone={kind} />

      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Click any cell to edit it. Use “New” to add a row.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <BudgetItemsFilters
            search={table.search}
            onSearchChange={table.setSearch}
            typeFilter={table.typeFilter}
            onTypeChange={table.setTypeFilter}
            typeOptions={typeOptions}
            hasActiveFilters={table.hasActiveFilters}
            onClear={table.clearFilters}
          />
          <BudgetItemsTable
            listLabel={kind === "income" ? "Income items" : "Expense items"}
            items={table.pageItems}
            tone={kind}
            currency={BUDGET_CURRENCY}
            typeOptions={typeOptions}
            defaultType={defaultType}
            accounts={accounts}
            currentPage={table.currentPage}
            totalPages={table.totalPages}
            totalItems={table.totalItems}
            itemsPerPage={table.itemsPerPage}
            hasActiveFilters={table.hasActiveFilters}
            emptyLabel={kind === "income" ? "No income items yet" : "No expense items yet"}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onRemove={onRemove}
            onNextPage={table.nextPage}
            onPreviousPage={table.prevPage}
            onItemsPerPageChange={table.setItemsPerPage}
            onClearFilters={table.clearFilters}
          />
        </CardContent>
      </Card>
    </>
  );
};
