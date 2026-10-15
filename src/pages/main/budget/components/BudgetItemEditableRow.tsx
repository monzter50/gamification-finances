import { Trash2 } from "lucide-react";

import { Button, InlineMoney, InlineSelect, InlineText } from "@/components/ui";
import { cn } from "@/lib/utils";

import {
  BUDGET_ITEM_CELL,
  BUDGET_ITEM_GRID,
  BUDGET_ITEM_ROW_SURFACE,
  NO_ACCOUNTS_MESSAGE,
  type BudgetItemOption,
  type BudgetItemPatch,
  type BudgetItemRow,
} from "./budgetItemTypes";

interface BudgetItemEditableRowProps {
  id: string;
  item: BudgetItemRow;
  tone: "income" | "expense";
  currency: string;
  typeOptions: readonly BudgetItemOption[];
  /** Present → the row shows an account cell. */
  accountOptions?: readonly BudgetItemOption[];
  // eslint-disable-next-line no-unused-vars
  onUpdate: (id: string, patch: BudgetItemPatch) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  onRemove: (id: string) => void;
}

/** One existing item. Every cell edits in place and saves on its own. */
export const BudgetItemEditableRow = ({
  id,
  item,
  tone,
  currency,
  typeOptions,
  accountOptions,
  onUpdate,
  onRemove,
}: BudgetItemEditableRowProps) => {
  const hasAccount = accountOptions !== undefined;

  return (
    <li
      className={cn(
        "grid",
        hasAccount ? BUDGET_ITEM_GRID.withAccount : BUDGET_ITEM_GRID.withoutAccount,
        BUDGET_ITEM_ROW_SURFACE,
      )}
    >
      <div className={BUDGET_ITEM_CELL.description}>
        <InlineText
          label="Description"
          value={item.description}
          onCommit={(description) => onUpdate(id, { description })}
        />
      </div>

      <div className={BUDGET_ITEM_CELL.type}>
        <InlineSelect
          label="Type"
          value={item.type}
          options={typeOptions}
          onCommit={(type) => onUpdate(id, { type })}
        />
      </div>

      {hasAccount && (
        <div className={BUDGET_ITEM_CELL.account}>
          <InlineSelect
            label="Account"
            value={item.accountId ?? ""}
            options={accountOptions}
            placeholder="No account"
            emptyMessage={NO_ACCOUNTS_MESSAGE}
            onCommit={(accountId) => onUpdate(id, { accountId })}
          />
        </div>
      )}

      <div
        className={
          hasAccount ? BUDGET_ITEM_CELL.amountWithAccount : BUDGET_ITEM_CELL.amountWithoutAccount
        }
      >
        <InlineMoney
          label="Amount"
          value={item.amount}
          currency={currency}
          tone={tone}
          onCommit={(amount) => onUpdate(id, { amount })}
        />
      </div>

      <div className={BUDGET_ITEM_CELL.actions}>
        <Button
          size="icon"
          variant="ghost"
          aria-label={`Remove ${item.description}`}
          onClick={() => onRemove(id)}
        >
          <Trash2 className="text-danger" />
        </Button>
      </div>
    </li>
  );
};
