import { Plus } from "lucide-react";
import { useRef, useState } from "react";

import { Button, EmptyState } from "@/components/ui";
import { BudgetItemDraftRow } from "@/features/budget/components/BudgetItemDraftRow";
import { BudgetItemEditableRow } from "@/features/budget/components/BudgetItemEditableRow";
import { BudgetItemsPagination } from "@/features/budget/components/BudgetItemsPagination";
import {
  BUDGET_ITEM_GRID,
  type BudgetItemPatch,
  type BudgetItemRow,
  type BudgetItemValues,
} from "@/features/budget/components/budgetItemTypes";
import { cn } from "@/lib/utils";
import type { Account } from "@/types/api";

export type {
  BudgetItemPatch,
  BudgetItemRow,
  BudgetItemValues,
} from "@/features/budget/components/budgetItemTypes";

interface BudgetItemsTableProps {
  /** Accessible name for the list, e.g. "Income items". */
  listLabel: string;
  items: BudgetItemRow[];
  tone: "income" | "expense";
  currency: string;
  typeOptions: readonly string[];
  /** Preselected type in the "+ New" row. */
  defaultType?: string;
  /** Pass to show the account column (income). Omit to hide it (expense). */
  accounts?: Account[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasActiveFilters: boolean;
  emptyLabel: string;
  // eslint-disable-next-line no-unused-vars
  onCreate: (values: BudgetItemValues) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  onUpdate: (id: string, patch: BudgetItemPatch) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  onRemove: (id: string) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  // eslint-disable-next-line no-unused-vars
  onItemsPerPageChange: (n: number) => void;
  onClearFilters: () => void;
}

/**
 * Notion-style items table: click any cell to edit it in place, "+ New" adds
 * a row at the bottom. Cards on mobile, a table from md up.
 */
export const BudgetItemsTable = ({
  listLabel,
  items,
  tone,
  currency,
  typeOptions,
  defaultType,
  accounts,
  hasActiveFilters,
  emptyLabel,
  onCreate,
  onUpdate,
  onRemove,
  onClearFilters,
  ...pagination
}: BudgetItemsTableProps) => {
  const [isDrafting, setIsDrafting] = useState(false);
  // After the "+ New" row closes, focus goes back to the "+ New" button.
  const refocusNewRef = useRef(false);

  const typeSelectOptions = typeOptions.map((t) => ({ value: t, label: t }));
  const accountOptions = accounts?.map((a) => ({ value: a.id, label: a.name }));
  const hasAccount = accountOptions !== undefined;

  const handleOpenDraft = () => setIsDrafting(true);
  const handleCloseDraft = () => {
    refocusNewRef.current = true;
    setIsDrafting(false);
  };

  if (items.length === 0 && !isDrafting) {
    return hasActiveFilters ? (
      <EmptyState
        title="No matches"
        description="No items match your filters."
        action={
          <Button variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        }
      />
    ) : (
      <EmptyState
        title={emptyLabel}
        description="Add your first item to start planning this month."
        action={
          <Button onClick={handleOpenDraft}>
            <Plus />
            New item
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        {/* Column headings, md and up. Each cell also carries its own label for screen readers. */}
        <div
          aria-hidden
          className={cn(
            "hidden pb-2 text-xs font-medium text-muted-foreground md:grid",
            hasAccount ? BUDGET_ITEM_GRID.withAccount : BUDGET_ITEM_GRID.withoutAccount,
          )}
        >
          <span className="px-2">Description</span>
          <span className="px-2">Type</span>
          {hasAccount && <span className="px-2">Account</span>}
          <span className="px-2 text-right">Amount</span>
          <span />
        </div>

        <ul
          aria-label={listLabel}
          className="space-y-2 md:space-y-0 md:divide-y md:divide-border md:border-y md:border-border"
        >
          {items.map((item) =>
            item.id ? (
              <BudgetItemEditableRow
                key={item.id}
                id={item.id}
                item={item}
                tone={tone}
                currency={currency}
                typeOptions={typeSelectOptions}
                accountOptions={accountOptions}
                onUpdate={onUpdate}
                onRemove={onRemove}
              />
            ) : null,
          )}
          {isDrafting && (
            <li className="py-2 md:py-1">
              <BudgetItemDraftRow
                currency={currency}
                typeOptions={typeSelectOptions}
                defaultType={defaultType}
                accountOptions={accountOptions}
                onSave={onCreate}
                onClose={handleCloseDraft}
              />
            </li>
          )}
        </ul>

        {!isDrafting && (
          <Button
            ref={(element) => {
              if (element && refocusNewRef.current) {
                refocusNewRef.current = false;
                element.focus();
              }
            }}
            variant="ghost"
            className="mt-2 w-full justify-start text-muted-foreground"
            onClick={handleOpenDraft}
          >
            <Plus />
            New
          </Button>
        )}
      </div>

      {pagination.totalItems > 0 && <BudgetItemsPagination {...pagination} />}
    </div>
  );
};
