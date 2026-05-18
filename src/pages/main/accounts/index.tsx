"use client";

import { CreditCard, Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  Button,
  EmptyState,
  Input,
  Label,
  Money,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Modal } from "@/components/ui/Modal";
import { useAccounts } from "@/hooks";
import { ACCOUNT_CARD_STYLES, ACCOUNT_TYPE_LABELS } from "@/lib/account-styles";
import { cn } from "@/lib/utils";
import type { Account, AccountType, CreateAccountDto } from "@/types/api";

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "checking",    label: "Checking" },
  { value: "savings",     label: "Savings" },
  { value: "credit_card", label: "Credit Card" },
  { value: "vales",       label: "Vales" },
];

interface AccountFormValues extends CreateAccountDto {
  balance?: number;
}

interface AccountCardProps {
  account: Account;
  // eslint-disable-next-line no-unused-vars
  onEdit: (account: Account) => void;
  // eslint-disable-next-line no-unused-vars
  onDelete: (account: Account) => void;
}

function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const style = ACCOUNT_CARD_STYLES[account.type] ?? ACCOUNT_CARD_STYLES.checking;

  return (
    <div className={cn(
      "group relative w-full max-w-sm h-48 rounded-2xl bg-gradient-to-br p-5 shadow-lg overflow-hidden select-none",
      style.gradient,
    )}>
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-14 -left-8 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />

      <div className="absolute top-3 right-3 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(account)}
          className={cn(
            "p-1.5 rounded-full bg-white/10 hover:bg-white/25 transition-colors",
            style.textColor,
          )}
          aria-label="Edit account"
          type="button"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(account)}
          className={cn(
            "p-1.5 rounded-full bg-white/10 hover:bg-danger/60 transition-colors",
            style.textColor,
          )}
          aria-label="Delete account"
          type="button"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="relative z-10 flex items-start justify-between pr-16">
        {/* EMV Chip — decorative; see lib/account-styles.ts for the chip palette */}
        {/* eslint-disable-next-line no-restricted-syntax */}
        <div className={cn("w-10 h-7 rounded-md bg-gradient-to-br shadow-md flex items-center justify-center", style.chipColor)}>
          {/* eslint-disable-next-line no-restricted-syntax */}
          <div className="w-7 h-5 rounded-[3px] border border-yellow-600/40 grid grid-cols-3 grid-rows-3 gap-[2px] p-[2px]">
            {/* eslint-disable-next-line no-restricted-syntax */}
            {Array.from({ length: 9 }).map((_, i) => (
              // eslint-disable-next-line no-restricted-syntax
              <div key={i} className="bg-yellow-600/40 rounded-[1px]" />
            ))}
          </div>
        </div>
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-[0.2em] opacity-70",
          style.textColor,
        )}>
          {ACCOUNT_TYPE_LABELS[account.type] ?? account.type}
        </span>
      </div>

      <div className="relative z-10 mt-4">
        <p className={cn("text-[10px] uppercase tracking-widest opacity-50", style.textColor)}>Balance</p>
        <div className={cn("font-bold leading-tight", style.textColor)}>
          <Money value={account.balance} currency={account.currency} size="md" className={cn("font-bold", style.textColor)} />
        </div>
      </div>

      <div className="absolute bottom-5 left-5 right-5 z-10 flex items-end justify-between">
        <p className={cn("text-sm font-semibold tracking-wide truncate pr-4", style.textColor)}>
          {account.name}
        </p>
        <CreditCard size={22} className={cn("opacity-40 shrink-0", style.textColor)} />
      </div>
    </div>
  );
}

export default function Accounts() {
  const { accounts, isLoading, isMutating, refresh, createAccount, updateAccount, deleteAccount } = useAccounts();

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [ isFormOpen, setIsFormOpen ] = useState(false);
  const [ editingAccount, setEditingAccount ] = useState<Account | null>(null);
  const [ deletingAccount, setDeletingAccount ] = useState<Account | null>(null);

  const isEditMode = editingAccount !== null;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AccountFormValues>({
    defaultValues: { name: "", type: "checking", balance: 0, currency: "MXN" },
  });

  const selectedType = watch("type");

  const handleOpenCreate = () => {
    setEditingAccount(null);
    reset({ name: "", type: "checking", balance: 0, currency: "MXN" });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (account: Account) => {
    setEditingAccount(account);
    reset({
      name:     account.name,
      type:     account.type,
      balance:  account.balance,
      currency: account.currency,
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAccount(null);
  };

  const onSubmit = handleSubmit(async (data) => {
    const payload: CreateAccountDto = { name: data.name.trim(), type: data.type };
    if (typeof data.balance === "number" && !Number.isNaN(data.balance)) {
      payload.balance = data.balance;
    }
    if (data.currency?.trim()) {
      payload.currency = data.currency.trim().toUpperCase();
    }
    const ok = isEditMode
      ? await updateAccount(editingAccount.id, payload)
      : await createAccount(payload);
    if (ok) { handleCloseForm(); }
  });

  const handleConfirmDelete = async () => {
    if (!deletingAccount) { return; }
    const ok = await deleteAccount(deletingAccount.id);
    if (ok) { setDeletingAccount(null); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts"
        description="Manage your bank and financial accounts."
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Account
          </Button>
        }
      />

      {/* Cards grid */}
      {isLoading && accounts.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-full max-w-sm h-48 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={<Wallet size={20} />}
          title="No accounts yet"
          description="Create your first account to start tracking your finances."
          action={
            <Button variant="outline" onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Account
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={handleOpenEdit}
              onDelete={setDeletingAccount}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={isFormOpen}
        onClose={handleCloseForm}
        title={isEditMode ? "Edit Account" : "New Account"}
      >
        <form onSubmit={onSubmit} className="px-6 pb-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? "Update your account details. Balance edits should be rare — prefer transactions."
              : "Create an account to track balances. The opening balance is optional."}
          </p>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              placeholder="e.g. Mi cuenta BBVA"
              {...register("name", {
                required: "Name is required",
                minLength: { value: 2, message: "At least 2 characters" },
              })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="type">Account Type</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue("type", value as AccountType, { shouldValidate: true })}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="balance">{isEditMode ? "Balance" : "Opening balance"}</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("balance", { valueAsNumber: true })}
              />
              {isEditMode && (
                <p className="text-[11px] text-muted-foreground">
                  Direct balance edits bypass transaction history.
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                placeholder="MXN"
                maxLength={3}
                {...register("currency", {
                  pattern: { value: /^[A-Za-z]{3}$/, message: "3-letter ISO code" },
                })}
              />
              {errors.currency && (
                <p className="text-sm text-destructive">{errors.currency.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleCloseForm} className="flex-1" disabled={isMutating}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isMutating}>
              {isMutating
                ? isEditMode ? "Saving..." : "Creating..."
                : isEditMode ? "Save Changes" : "Create Account"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={deletingAccount !== null}
        onClose={() => !isMutating && setDeletingAccount(null)}
        title="Delete Account"
      >
        <div className="px-6 pb-6 space-y-4">
          <p className="text-sm">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{deletingAccount?.name}</span>?
          </p>
          <p className="text-xs text-muted-foreground">
            The server will reject this if the account has any transactions.
            You&apos;ll need to delete or reassign those first.
          </p>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setDeletingAccount(null)}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              onClick={handleConfirmDelete}
              disabled={isMutating}
            >
              {isMutating ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
