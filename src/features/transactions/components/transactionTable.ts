import type { InlineSelectOption } from "@/components/ui";

export type TxOption = InlineSelectOption;

export const TX_TYPE_OPTIONS: readonly TxOption[] = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
];

export const NO_ACCOUNTS_MESSAGE = "No accounts yet. Create one on the Accounts page.";

/**
 * Grid shared by the header, the rows and the "+ New" row so columns line up.
 *
 * Mobile, each row is a card:        md and up, one table row:
 *   [vendor ...............][⋯]        date | vendor | type | account | amount | ⋯
 *   [date ][type .............]
 *   [account][amount ..........]
 *
 * Display (`grid` / `hidden md:grid`) is set by each consumer.
 */
export const TX_GRID =
  "grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-x-2 gap-y-1 md:grid-cols-[8.5rem_minmax(0,2fr)_7rem_minmax(0,1fr)_minmax(0,1fr)_5rem] md:items-center";

export const TX_CELL = {
  date: "col-span-1",
  // Pinned to the first mobile row; everything goes back to source order from md.
  vendor: "col-span-2 col-start-1 row-start-1 md:col-span-1 md:col-start-auto md:row-start-auto",
  type: "col-span-2 md:col-span-1",
  account: "col-span-1",
  amount: "col-span-2 md:col-span-1",
  actions: "col-start-3 row-start-1 flex justify-end gap-1 md:col-start-auto md:row-start-auto",
} as const;

/** Card on mobile, flat table row from md up. */
export const TX_ROW_SURFACE =
  "rounded-lg border border-border bg-card p-2 md:rounded-none md:border-0 md:bg-transparent md:px-0 md:py-1";
