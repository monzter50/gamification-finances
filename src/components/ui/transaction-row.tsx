import * as React from "react";

import { Money } from "@/components/ui/money";
import { TxTypePill } from "@/components/ui/tx-type-pill";
import { cn } from "@/lib/utils";

/**
 * TransactionRow — composed pattern for a single transaction in a list.
 * Composes <Money> + <TxTypePill> so feature code never reaches for raw
 * colors or formatters.
 *
 *   <TransactionRow
 *     vendor="Spotify"
 *     date="2026-05-12"
 *     accountName="Checking"
 *     amount={9.99}
 *     type="expense"
 *     currency="MXN"
 *     onClick={() => navigate(`/transactions/${tx.id}`)}
 *   />
 */

export type TxType = "income" | "expense";

export interface TransactionRowProps {
  vendor: string;
  /** ISO date string. Formatted with browser locale. */
  date: string;
  amount: number;
  type: TxType;
  accountName?: string;
  currency?: string;
  onClick?: () => void;
  className?: string;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

export const TransactionRow = React.forwardRef<HTMLButtonElement, TransactionRowProps>(
  ({ vendor, date, amount, type, accountName, currency, onClick, className }, ref) => {
    // Display sign reflects flow direction: income +, expense −.
    const signed = type === "expense" ? -amount : amount;

    const content = (
      <>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-foreground">{vendor}</p>
          <p className="text-xs text-muted-foreground truncate">
            {formatDate(date)}
            {accountName ? ` · ${accountName}` : ""}
          </p>
        </div>
        <TxTypePill type={type} label={type === "income" ? "Income" : "Expense"} />
        <Money
          value={signed}
          tone="auto"
          signed
          size="sm"
          currency={currency}
          className="w-24 text-right font-semibold"
        />
      </>
    );

    if (!onClick) {
      return (
        <div className={cn("flex items-center gap-3 py-2 px-2", className)}>{content}</div>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-3 py-2 px-2 -mx-2 rounded-md hover:bg-muted/50 text-left",
          "transition-colors duration-fast ease-standard",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          className,
        )}
      >
        {content}
      </button>
    );
  },
);
TransactionRow.displayName = "TransactionRow";
