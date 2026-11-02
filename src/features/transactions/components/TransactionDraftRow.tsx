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
  NO_ACCOUNTS_MESSAGE,
  TX_CELL,
  TX_GRID,
  TX_TYPE_OPTIONS,
  type TxOption,
} from "@/features/transactions/components/transactionTable";
import { cn } from "@/lib/utils";
import type { CreateTransactionDto, TransactionType } from "@/types/api";

type Field = "date" | "vendor" | "accountId" | "amount";

interface TransactionDraftRowProps {
  currency: string;
  accountOptions: readonly TxOption[];
  defaultDate: string;
  /** The budget a `yyyy-mm-dd` day belongs to, or null when none exists. */
  // eslint-disable-next-line no-unused-vars
  resolveBudgetId: (day: string) => string | null;
  /** Reject to keep the typed values; the caller surfaces the error. */
  // eslint-disable-next-line no-unused-vars
  onSave: (values: CreateTransactionDto) => Promise<void>;
  onClose: () => void;
}

/**
 * The "+ New" transaction row. Enter saves and keeps the row open for the next
 * one (date, type and account stay); Escape in a text field closes it.
 */
export const TransactionDraftRow = ({
  currency,
  accountOptions,
  defaultDate,
  resolveBudgetId,
  onSave,
  onClose,
}: TransactionDraftRowProps) => {
  const idPrefix = useId();
  const vendorRef = useRef<HTMLInputElement>(null);
  const [date, setDate] = useState(defaultDate);
  const [vendor, setVendor] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [pickedAccountId, setPickedAccountId] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [isPending, setIsPending] = useState(false);

  // Accounts can arrive after mount, so fall back to the first one until the user picks.
  const accountId = pickedAccountId || accountOptions[0]?.value || "";

  const describedBy = (field: Field) => ({
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `${idPrefix}-${field}` : undefined,
  });
  const errorFor = (field: Field) => (
    <FieldError id={`${idPrefix}-${field}`} message={errors[field]} />
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

    const budgetId = date ? resolveBudgetId(date) : null;
    const next: Partial<Record<Field, string>> = {};
    if (!date) {
      next.date = "Pick a date";
    } else if (!budgetId) {
      next.date = "No budget for this month yet";
    }
    if (!vendor.trim()) {
      next.vendor = "Vendor is required";
    }
    if (!accountId) {
      next.accountId = "Create an account first";
    }
    if (amount === null || amount <= 0) {
      next.amount = "Amount must be greater than 0";
    }
    setErrors(next);
    if (Object.keys(next).length > 0 || !budgetId || amount === null) {
      return;
    }

    setIsPending(true);
    try {
      // category/owner aren't edited in this UI; the API accepts them empty.
      await onSave({
        budgetId,
        accountId,
        date,
        type,
        vendor: vendor.trim(),
        amount,
        category: "",
        owner: "",
      });
      setVendor("");
      setAmount(null);
      vendorRef.current?.focus();
    } catch {
      // The caller already surfaced the error; keep the values for a retry.
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      noValidate
      aria-label="New transaction"
      onSubmit={handleSubmit}
      className={cn(
        "grid rounded-lg border border-ring/50 bg-muted/40 p-2 md:rounded-md md:p-1",
        TX_GRID,
      )}
    >
      <div className={TX_CELL.date}>
        <Input
          type="date"
          aria-label="Date"
          value={date}
          onKeyDown={handleEscape}
          onChange={(e) => {
            setDate(e.target.value);
            clearError("date");
          }}
          {...describedBy("date")}
        />
        {errorFor("date")}
      </div>

      <div className={TX_CELL.vendor}>
        <Input
          ref={vendorRef}
          autoFocus
          aria-label="Vendor"
          placeholder="Vendor"
          value={vendor}
          onKeyDown={handleEscape}
          onChange={(e) => {
            setVendor(e.target.value);
            clearError("vendor");
          }}
          {...describedBy("vendor")}
        />
        {errorFor("vendor")}
      </div>

      <div className={TX_CELL.type}>
        <Select value={type} onValueChange={(v) => setType(v as TransactionType)}>
          <SelectTrigger aria-label="Type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TX_TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={TX_CELL.account}>
        <Select
          value={accountId}
          onValueChange={(v) => {
            setPickedAccountId(v);
            clearError("accountId");
          }}
        >
          <SelectTrigger aria-label="Account" {...describedBy("accountId")}>
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
        {errorFor("accountId")}
      </div>

      <div className={TX_CELL.amount}>
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
          {...describedBy("amount")}
        />
        {errorFor("amount")}
      </div>

      <div className={TX_CELL.actions}>
        <Button
          type="submit"
          size="icon"
          aria-label="Save transaction"
          disabled={isPending}
          aria-busy={isPending}
        >
          <Check />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Close new transaction"
          onClick={onClose}
        >
          <X />
        </Button>
      </div>
    </form>
  );
};
