import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  Button,
  Input,
  Label,
  MoneyInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Modal } from "@/components/ui/Modal";
import type {
  Account,
  CreateTransactionDto,
  Transaction,
  TransactionType,
} from "@/types/api";
import type { Budget, ExpenseItem, IncomeItem } from "@/types/budget";

export interface TransactionFormValues {
  budgetId: string;
  accountId: string;
  date: string;
  type: TransactionType;
  vendor: string;
  amount: number | null;
  description?: string;
  incomeItemId?: string;
  expenseItemId?: string;
}

interface TransactionFormModalProps {
  open: boolean;
  editingTransaction: Transaction | null;
  accounts: Account[];
  budgets: Budget[];
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (values: CreateTransactionDto) => Promise<void>;
  isSubmitting?: boolean;
}

const DEFAULT_CURRENCY = "MXN";

const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: "expense",
    label: "Expense" },
  { value: "income",
    label: "Income"  },
];

const EMPTY_DEFAULTS: TransactionFormValues = {
  budgetId:       "",
  accountId:      "",
  date:           new Date().toISOString().split("T")[0],
  type:           "expense",
  vendor:         "",
  amount:         null,
  description:    "",
  incomeItemId:   "",
  expenseItemId:  "",
};

// Format option-row amounts. Selects can't host <Money> ergonomically (it's a
// block-level span) — this is a small string helper for select rows only.
const formatOptionAmount = (n: number, currency = DEFAULT_CURRENCY) =>
  `${n.toLocaleString(undefined, { minimumFractionDigits: 0,
    maximumFractionDigits: 2 })} ${currency}`;

export function TransactionFormModal({
  open,
  editingTransaction,
  accounts,
  budgets,
  onClose,
  onSubmit,
  isSubmitting = false,
}: TransactionFormModalProps) {
  const isEditMode = editingTransaction !== null;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    defaultValues: EMPTY_DEFAULTS,
  });

  const selectedType     = watch("type");
  const selectedBudgetId = watch("budgetId");
  const selectedBudget   = useMemo(
    () => budgets.find((b) => b.id === selectedBudgetId) ?? null,
    [ budgets, selectedBudgetId ],
  );

  useEffect(() => {
    if (!open) { return; }

    if (editingTransaction) {
      reset({
        budgetId:      editingTransaction.budgetId ?? "",
        accountId:     editingTransaction.accountId,
        date:          new Date(editingTransaction.date).toISOString().split("T")[0],
        type:          editingTransaction.type,
        vendor:        editingTransaction.vendor,
        amount:        editingTransaction.amount,
        description:   editingTransaction.description ?? "",
        incomeItemId:  editingTransaction.incomeItemId ?? "",
        expenseItemId: editingTransaction.expenseItemId ?? "",
      });
    } else {
      reset(EMPTY_DEFAULTS);
    }
  }, [ open, editingTransaction, reset ]);

  useEffect(() => {
    setValue("incomeItemId", "");
    setValue("expenseItemId", "");
  }, [ selectedType, selectedBudgetId, setValue ]);

  const incomeItems: IncomeItem[]   = selectedBudget?.incomeItems  ?? [];
  const expenseItems: ExpenseItem[] = selectedBudget?.expenseItems ?? [];

  const submitHandler = handleSubmit(async (values) => {
    const payload: CreateTransactionDto = {
      budgetId:    values.budgetId,
      accountId:   values.accountId,
      date:        values.date,
      type:        values.type,
      vendor:      values.vendor.trim(),
      amount:      Number(values.amount ?? 0),
      category:    "",
      owner:       "",
    };

    if (values.description?.trim()) {
      payload.description = values.description.trim();
    }
    if (values.type === "income" && values.incomeItemId) {
      payload.incomeItemId = values.incomeItemId;
    }
    if (values.type === "expense" && values.expenseItemId) {
      payload.expenseItemId = values.expenseItemId;
    }

    await onSubmit(payload);
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditMode ? "Edit Transaction" : "Add Transaction"}
    >
      <form onSubmit={submitHandler} className="px-6 pb-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          Transactions move real money — the account balance updates atomically.
        </p>

        {/* Budget */}
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="budgetId">Budget</Label>
          <Select
            value={selectedBudgetId}
            onValueChange={(v) => setValue("budgetId", v, { shouldValidate: true })}
            disabled={isEditMode}
          >
            <SelectTrigger id="budgetId">
              <SelectValue placeholder="Select a budget" />
            </SelectTrigger>
            <SelectContent>
              {budgets.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No budgets yet — create one first.
                </div>
              ) : (
                budgets.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.year} / {String(b.month + 1).padStart(2, "0")}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <input
            type="hidden"
            {...register("budgetId", { required: "Budget is required" })}
          />
          {errors.budgetId && (
            <p className="text-sm text-destructive">{errors.budgetId.message}</p>
          )}
        </div>

        {/* Type */}
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <Select
            value={selectedType}
            onValueChange={(v) => setValue("type", v as TransactionType, { shouldValidate: true })}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select transaction type" />
            </SelectTrigger>
            <SelectContent>
              {TRANSACTION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Linked income/expense item */}
        {selectedBudget && selectedType === "income" && incomeItems.length > 0 && (
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="incomeItemId">Linked income plan (optional)</Label>
            <Select
              value={watch("incomeItemId") ?? ""}
              onValueChange={(v) => setValue("incomeItemId", v)}
            >
              <SelectTrigger id="incomeItemId">
                <SelectValue placeholder="Not linked to a planned income" />
              </SelectTrigger>
              <SelectContent>
                {incomeItems.map((item) => (
                  <SelectItem key={item.id} value={item.id ?? ""}>
                    {item.description} — {formatOptionAmount(item.amount)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedBudget && selectedType === "expense" && expenseItems.length > 0 && (
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="expenseItemId">Linked expense category (optional)</Label>
            <Select
              value={watch("expenseItemId") ?? ""}
              onValueChange={(v) => setValue("expenseItemId", v)}
            >
              <SelectTrigger id="expenseItemId">
                <SelectValue placeholder="Not linked to a planned expense" />
              </SelectTrigger>
              <SelectContent>
                {expenseItems.map((item) => (
                  <SelectItem key={item.id} value={item.id ?? ""}>
                    {item.description} — {formatOptionAmount(item.amount)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Account */}
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="accountId">Account</Label>
          <Select
            value={watch("accountId")}
            onValueChange={(v) => setValue("accountId", v, { shouldValidate: true })}
          >
            <SelectTrigger id="accountId">
              <SelectValue placeholder="Select an account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No accounts yet — create one first.
                </div>
              ) : (
                accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} · {formatOptionAmount(a.balance, a.currency)}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <input
            type="hidden"
            {...register("accountId", { required: "Account is required" })}
          />
          {errors.accountId && (
            <p className="text-sm text-destructive">{errors.accountId.message}</p>
          )}
        </div>

        {/* Date */}
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            {...register("date", { required: "Date is required" })}
          />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        {/* Vendor */}
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="vendor">Vendor</Label>
          <Input
            id="vendor"
            placeholder="e.g., Walmart, Employer"
            {...register("vendor", {
              required: "Vendor is required",
              minLength: { value: 2,
                message: "At least 2 characters" },
            })}
          />
          {errors.vendor && (
            <p className="text-sm text-destructive">{errors.vendor.message}</p>
          )}
        </div>

        {/* Amount — via design-system MoneyInput */}
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="amount">Amount</Label>
          <Controller
            control={control}
            name="amount"
            rules={{
              required: "Amount is required",
              validate: (v) => (v !== null && v > 0) || "Amount must be greater than 0",
            }}
            render={({ field }) => (
              <MoneyInput
                id="amount"
                value={field.value ?? null}
                onChange={field.onChange}
                onBlur={field.onBlur}
                currency={DEFAULT_CURRENCY}
                placeholder="0.00"
              />
            )}
          />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="description">Description (optional)</Label>
          <Input
            id="description"
            placeholder="Free-form notes"
            {...register("description")}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting
              ? isEditMode ? "Saving..." : "Adding..."
              : isEditMode ? "Save Changes" : "Add Transaction"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
