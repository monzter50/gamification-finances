import { Maximize2, Trash2 } from "lucide-react";

import { Button, InlineDate, InlineMoney, InlineSelect, InlineText } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Transaction, TransactionType, UpdateTransactionDto } from "@/types/api";

import {
  NO_ACCOUNTS_MESSAGE,
  TX_CELL,
  TX_GRID,
  TX_ROW_SURFACE,
  TX_TYPE_OPTIONS,
  type TxOption,
} from "./transactionTable";

interface TransactionEditableRowProps {
  transaction: Transaction;
  currency: string;
  accountOptions: readonly TxOption[];
  // eslint-disable-next-line no-unused-vars
  onUpdate: (id: string, patch: UpdateTransactionDto) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  onOpenDetails: (id: string) => void;
  // eslint-disable-next-line no-unused-vars
  onRemove: (id: string) => void;
}

/**
 * One transaction. Date, vendor, type, account and amount edit in place and
 * each saves only the field that changed. Description and the linked plan
 * live behind "Open details".
 */
export const TransactionEditableRow = ({
  transaction: tx,
  currency,
  accountOptions,
  onUpdate,
  onOpenDetails,
  onRemove,
}: TransactionEditableRowProps) => {
  const update = (patch: UpdateTransactionDto) => onUpdate(tx.id, patch);

  const handleTypeCommit = (type: string) =>
    update({
      type: type as TransactionType,
      // A link to an income plan makes no sense on an expense (and vice versa).
      ...(tx.incomeItemId || tx.expenseItemId ? { incomeItemId: null, expenseItemId: null } : {}),
    });

  return (
    <li className={cn("grid", TX_GRID, TX_ROW_SURFACE)}>
      <div className={TX_CELL.date}>
        <InlineDate
          label="Date"
          value={tx.date.slice(0, 10)}
          onCommit={(date) => update({ date })}
        />
      </div>

      <div className={cn(TX_CELL.vendor, "min-w-0")}>
        <InlineText label="Vendor" value={tx.vendor} onCommit={(vendor) => update({ vendor })} />
        {tx.description && (
          <p className="truncate px-2 text-xs text-muted-foreground">{tx.description}</p>
        )}
      </div>

      <div className={TX_CELL.type}>
        <InlineSelect
          label="Type"
          value={tx.type}
          options={TX_TYPE_OPTIONS}
          onCommit={handleTypeCommit}
        />
      </div>

      <div className={TX_CELL.account}>
        <InlineSelect
          label="Account"
          value={tx.accountId}
          options={accountOptions}
          placeholder="No account"
          emptyMessage={NO_ACCOUNTS_MESSAGE}
          onCommit={(accountId) => update({ accountId })}
        />
      </div>

      <div className={TX_CELL.amount}>
        <InlineMoney
          label="Amount"
          value={tx.amount}
          currency={currency}
          tone={tx.type}
          onCommit={(amount) => update({ amount })}
        />
      </div>

      <div className={TX_CELL.actions}>
        <Button
          size="icon"
          variant="ghost"
          aria-label={`Open details for ${tx.vendor}`}
          onClick={() => onOpenDetails(tx.id)}
        >
          <Maximize2 className="text-muted-foreground" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label={`Remove ${tx.vendor}`}
          onClick={() => onRemove(tx.id)}
        >
          <Trash2 className="text-danger" />
        </Button>
      </div>
    </li>
  );
};
