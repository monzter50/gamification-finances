import { Check, X } from "lucide-react";
import { useId, useRef, useState } from "react";

import {
  Button,
  FieldError,
  Input,
  MoneyInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import {
  BUDGET_ITEM_CELL,
  BUDGET_ITEM_GRID,
  NO_ACCOUNTS_MESSAGE,
  type BudgetItemOption,
  type BudgetItemValues,
} from "@/features/budget/components/budgetItemTypes";
import { cn } from "@/lib/utils";

type Field = "description" | "type" | "accountId" | "amount";

interface BudgetItemDraftRowProps {
  currency: string;
  typeOptions: readonly BudgetItemOption[];
  defaultType?: string;
  /** Present → the row asks for an account (required). */
  accountOptions?: readonly BudgetItemOption[];
  /** Reject to keep the typed values; the caller surfaces the error. */
  // eslint-disable-next-line no-unused-vars
  onSave: (values: BudgetItemValues) => Promise<void>;
  onClose: () => void;
}

/**
 * The "+ New" row. Enter saves and keeps the row open for the next item
 * (type and account stay); Escape in a text field closes it.
 */
export const BudgetItemDraftRow = ({
  currency,
  typeOptions,
  defaultType = "",
  accountOptions,
  onSave,
  onClose,
}: BudgetItemDraftRowProps) => {
  const errorIdPrefix = useId();
  const descriptionRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [type, setType] = useState(defaultType);
  const [pickedAccountId, setPickedAccountId] = useState("");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [isPending, setIsPending] = useState(false);

  const hasAccount = accountOptions !== undefined;
  // Accounts can arrive after mount, so fall back to the first one until the user picks.
  const accountId = pickedAccountId || accountOptions?.[0]?.value || "";

  const errorProps = (field: Field) => ({
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `${errorIdPrefix}-${field}` : undefined,
  });
  const errorText = (field: Field) => (
    <FieldError id={`${errorIdPrefix}-${field}`} message={errors[field]} />
  );
  const clearError = (field: Field) => setErrors((prev) => ({ ...prev, [field]: undefined }));

  const handleEscape = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) {
      return;
    }

    const next: Partial<Record<Field, string>> = {};
    if (!description.trim()) {
      next.description = "Description is required";
    }
    if (!type) {
      next.type = "Pick a type";
    }
    if (hasAccount && !accountId) {
      next.accountId = "Create an account first";
    }
    if (amount === null || amount <= 0) {
      next.amount = "Amount must be greater than 0";
    }
    setErrors(next);
    if (Object.keys(next).length > 0 || amount === null) {
      return;
    }

    setIsPending(true);
    try {
      await onSave({ description: description.trim(), amount, type, accountId });
      setDescription("");
      setAmount(null);
      descriptionRef.current?.focus();
    } catch {
      // The caller already surfaced the error; keep the values for a retry.
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      noValidate
      aria-label="New item"
      onSubmit={handleSubmit}
      className={cn(
        "grid rounded-lg border border-ring/50 bg-muted/40 p-2 md:rounded-md md:p-1",
        hasAccount ? BUDGET_ITEM_GRID.withAccount : BUDGET_ITEM_GRID.withoutAccount,
      )}
    >
      <div className={BUDGET_ITEM_CELL.description}>
        <Input
          ref={descriptionRef}
          autoFocus
          aria-label="Description"
          placeholder="Description"
          value={description}
          onKeyDown={handleEscape}
          onChange={(e) => {
            setDescription(e.target.value);
            clearError("description");
          }}
          {...errorProps("description")}
        />
        {errorText("description")}
      </div>

      <div className={BUDGET_ITEM_CELL.type}>
        <Select
          value={type}
          onValueChange={(v) => {
            setType(v);
            clearError("type");
          }}
        >
          <SelectTrigger aria-label="Type" {...errorProps("type")}>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errorText("type")}
      </div>

      {hasAccount && (
        <div className={BUDGET_ITEM_CELL.account}>
          <Select
            value={accountId}
            onValueChange={(v) => {
              setPickedAccountId(v);
              clearError("accountId");
            }}
          >
            <SelectTrigger aria-label="Account" {...errorProps("accountId")}>
              <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
              {accountOptions.length === 0 ? (
                <p className="px-2 py-1.5 text-sm text-muted-foreground">{NO_ACCOUNTS_MESSAGE}</p>
              ) : (
                accountOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errorText("accountId")}
        </div>
      )}

      <div
        className={
          hasAccount ? BUDGET_ITEM_CELL.amountWithAccount : BUDGET_ITEM_CELL.amountWithoutAccount
        }
      >
        <MoneyInput
          aria-label="Amount"
          placeholder="0.00"
          currency={currency}
          value={amount}
          onKeyDown={handleEscape}
          onChange={(v) => {
            setAmount(v);
            clearError("amount");
          }}
          {...errorProps("amount")}
        />
        {errorText("amount")}
      </div>

      <div className={BUDGET_ITEM_CELL.actions}>
        <Button
          type="submit"
          size="icon"
          aria-label="Save item"
          disabled={isPending}
          aria-busy={isPending}
        >
          <Check />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Close new item"
          onClick={onClose}
        >
          <X />
        </Button>
      </div>
    </form>
  );
};
