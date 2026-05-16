import type { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/Modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TransactionType, CreateTransactionRequest, Account } from "@/types/api";

const TRANSACTION_TYPES: TransactionType[] = [ "income", "expense" ];

const TRANSACTION_CATEGORIES = {
  income: [ "Salary", "Freelance", "Investment", "Bonus", "Gift", "Other" ],
  expense: [ "Housing", "Food", "Transportation", "Utilities", "Entertainment", "Healthcare", "Shopping", "Other" ],
  savings: [ "Emergency Fund", "Investment", "Retirement", "Goal Savings", "Other" ],
};

interface TransactionModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  onClose: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  register: UseFormRegister<CreateTransactionRequest>;
  setValue: UseFormSetValue<CreateTransactionRequest>;
  watch: UseFormWatch<CreateTransactionRequest>;
  errors: FieldErrors<CreateTransactionRequest>;
  accounts: Account[];
}

export function TransactionModal({
  isOpen,
  isEditMode,
  onClose,
  onSubmit,
  register,
  setValue,
  watch,
  errors,
  accounts,
}: TransactionModalProps) {
  const transactionType = watch("type");
  const availableCategories = transactionType ? TRANSACTION_CATEGORIES[transactionType] : [];

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Transaction" : "Add Transaction"}
    >
      <form onSubmit={onSubmit} className="px-6 pb-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          {isEditMode ? "Update your transaction details." : "Add a new transaction to track your finances."}
        </p>

        <div className="space-y-4">
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

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="type">Type</Label>
            <Select
              value={transactionType}
              onValueChange={(value) => {
                setValue("type", value as TransactionType, { shouldValidate: true });
                // Reset category when type changes
                setValue("category", "");
              }}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Select
              value={watch("category")}
              onValueChange={(value) => setValue("category", value, { shouldValidate: true })}
              disabled={!transactionType}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder={transactionType ? "Select category" : "Select type first"} />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="vendor">Vendor</Label>
            <Input
              id="vendor"
              placeholder="e.g., Amazon, Walmart"
              {...register("vendor", { required: "Vendor is required" })}
            />
            {errors.vendor && (
              <p className="text-sm text-destructive">{errors.vendor.message}</p>
            )}
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="accountId">Account</Label>
            <Select
              value={watch("accountId")}
              onValueChange={(value) => setValue("accountId", value, { shouldValidate: true })}
            >
              <SelectTrigger id="accountId">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({account.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.accountId && (
              <p className="text-sm text-destructive">{errors.accountId.message}</p>
            )}
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g., Monthly rent, Grocery shopping"
              {...register("description", { required: "Description is required" })}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="amount">Amount (MXN)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount", {
                required: "Amount is required",
                min: { value: 0.01,
                  message: "Amount must be greater than 0" }
              })}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            {isEditMode ? "Update Transaction" : "Add Transaction"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
