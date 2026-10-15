import { Plus } from "lucide-react";
import { useRef, useState } from "react";

import { Button, EmptyState, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Account, CreateTransactionDto, Transaction, UpdateTransactionDto } from "@/types/api";

import { TransactionDraftRow } from "./TransactionDraftRow";
import { TransactionEditableRow } from "./TransactionEditableRow";
import { TransactionsPagination } from "./TransactionsPagination";
import { TX_GRID } from "./transactionTable";

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  accounts: Account[];
  currency: string;
  /** Prefilled date in the "+ New" row (`yyyy-mm-dd`). */
  defaultDate: string;
  // eslint-disable-next-line no-unused-vars
  resolveBudgetId: (day: string) => string | null;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  // eslint-disable-next-line no-unused-vars
  onCreate: (values: CreateTransactionDto) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  onUpdate: (id: string, patch: UpdateTransactionDto) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  onOpenDetails: (id: string) => void;
  // eslint-disable-next-line no-unused-vars
  onRemove: (id: string) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

/**
 * Notion-style transactions table: click any cell to edit it in place. The
 * list is newest first, so "+ New" sits at the top. Cards on mobile, a table
 * from md up. Used by the global and the budget transactions pages.
 */
export const TransactionsTable = ({
  transactions,
  isLoading,
  accounts,
  currency,
  defaultDate,
  resolveBudgetId,
  hasActiveFilters = false,
  onClearFilters,
  onCreate,
  onUpdate,
  onOpenDetails,
  onRemove,
  ...pagination
}: TransactionsTableProps) => {
  const [isDrafting, setIsDrafting] = useState(false);
  // After the "+ New" row closes, focus goes back to the "+ New" button.
  const refocusNewRef = useRef(false);
  const accountOptions = accounts.map((a) => ({ value: a.id, label: a.name }));

  const handleCloseDraft = () => {
    refocusNewRef.current = true;
    setIsDrafting(false);
  };

  // Skeleton only for the first load. Reloads after an edit keep the rows
  // mounted, so the cell being edited doesn't vanish.
  if (isLoading && transactions.length === 0 && !isDrafting) {
    return (
      <div className="space-y-2" aria-busy>
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0 && !isDrafting) {
    return hasActiveFilters ? (
      <EmptyState
        title="No matches"
        description="No transactions match your filters."
        action={
          onClearFilters && (
            <Button variant="outline" onClick={onClearFilters}>
              Clear filters
            </Button>
          )
        }
      />
    ) : (
      <EmptyState
        title="No transactions yet"
        description="Record money in or out to see it here."
        action={
          <Button onClick={() => setIsDrafting(true)}>
            <Plus />
            New transaction
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        {isDrafting ? (
          <div className="mb-2">
            <TransactionDraftRow
              currency={currency}
              accountOptions={accountOptions}
              defaultDate={defaultDate}
              resolveBudgetId={resolveBudgetId}
              onSave={onCreate}
              onClose={handleCloseDraft}
            />
          </div>
        ) : (
          <Button
            ref={(element) => {
              if (element && refocusNewRef.current) {
                refocusNewRef.current = false;
                element.focus();
              }
            }}
            variant="ghost"
            className="mb-2 w-full justify-start text-muted-foreground"
            onClick={() => setIsDrafting(true)}
          >
            <Plus />
            New
          </Button>
        )}

        {/* Column headings, md and up. Each cell also carries its own label for screen readers. */}
        <div
          aria-hidden
          className={cn("hidden pb-2 text-xs font-medium text-muted-foreground md:grid", TX_GRID)}
        >
          <span className="px-2">Date</span>
          <span className="px-2">Vendor</span>
          <span className="px-2">Type</span>
          <span className="px-2">Account</span>
          <span className="px-2 text-right">Amount</span>
          <span />
        </div>

        <ul
          aria-label="Transactions"
          className="space-y-2 md:space-y-0 md:divide-y md:divide-border md:border-y md:border-border"
        >
          {transactions.map((transaction) => (
            <TransactionEditableRow
              key={transaction.id}
              transaction={transaction}
              currency={currency}
              accountOptions={accountOptions}
              onUpdate={onUpdate}
              onOpenDetails={onOpenDetails}
              onRemove={onRemove}
            />
          ))}
        </ul>
      </div>

      {pagination.totalItems > 0 && <TransactionsPagination {...pagination} />}
    </div>
  );
};
