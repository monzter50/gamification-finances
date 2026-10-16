import type { InlineSelectOption } from "@/components/ui";

/** Row shape shared by IncomeItem and ExpenseItem. */
export interface BudgetItemRow {
  id?: string;
  description: string;
  amount: number;
  type: string;
  /** Income items only. */
  accountId?: string;
}

/** What the "+ New" row hands back. `accountId` is "" when the table has no account column. */
export interface BudgetItemValues {
  description: string;
  amount: number;
  type: string;
  accountId: string;
}

/** A single-cell edit from the table. */
export type BudgetItemPatch = Partial<BudgetItemValues>;

export type BudgetItemOption = InlineSelectOption;

/**
 * Grid shared by the header, the rows and the "+ New" row so columns line up.
 *
 * Mobile, each row is a card:      md and up, one table row:
 *   [description ........][⋯]        description | type | account | amount | ⋯
 *   [type ][account / amount ]
 *   [amount (income) ........]
 *
 * Display (`grid` / `hidden md:grid`) is set by each consumer.
 */
export const BUDGET_ITEM_GRID = {
  withAccount:
    "grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-x-2 gap-y-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_5rem] md:items-center",
  withoutAccount:
    "grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-x-2 gap-y-1 md:grid-cols-[minmax(0,3fr)_minmax(0,1fr)_minmax(0,1fr)_5rem] md:items-center",
} as const;

export const BUDGET_ITEM_CELL = {
  description: "col-span-2 md:col-span-1",
  type: "col-span-1",
  account: "col-span-2 md:col-span-1",
  amountWithAccount: "col-span-3 md:col-span-1",
  amountWithoutAccount: "col-span-2 md:col-span-1",
  actions: "col-start-3 row-start-1 flex justify-end gap-1 md:col-start-auto md:row-start-auto",
} as const;

/** Card on mobile, flat table row from md up. */
export const BUDGET_ITEM_ROW_SURFACE =
  "rounded-lg border border-border bg-card p-2 md:rounded-none md:border-0 md:bg-transparent md:px-0 md:py-1";

export const NO_ACCOUNTS_MESSAGE = "No accounts yet. Create one on the Accounts page.";
