"use client";

import { CreditCard, Pencil, Plus, Wallet } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/Modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSnackbar } from "@/hooks";
import { accountService } from "@/services/account.service";
import type { Account, AccountType, CreateAccountDto } from "@/types/api";

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "checking",
    label: "Checking" },
  { value: "savings",
    label: "Savings" },
  { value: "credit_card",
    label: "Credit Card" },
  { value: "vales",
    label: "Vales" },
];

const TYPE_LABEL: Record<AccountType, string> = {
  checking:    "Checking",
  savings:     "Savings",
  credit_card: "Credit Card",
  vales:       "Vales",
};

const CARD_STYLES: Record<AccountType, { gradient: string; textColor: string; chipColor: string }> = {
  checking:    { gradient: "from-blue-600 via-blue-700 to-blue-900",
    textColor: "text-blue-50",
    chipColor: "from-yellow-300 to-yellow-500" },
  savings:     { gradient: "from-emerald-500 via-emerald-600 to-emerald-900",
    textColor: "text-emerald-50",
    chipColor: "from-yellow-300 to-yellow-500" },
  credit_card: { gradient: "from-slate-600 via-slate-700 to-slate-950",
    textColor: "text-slate-50",
    chipColor: "from-yellow-300 to-yellow-500" },
  vales:       { gradient: "from-orange-500 via-orange-600 to-orange-900",
    textColor: "text-orange-50",
    chipColor: "from-yellow-300 to-yellow-500" },
};

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
}

function AccountCard({ account, onEdit }: AccountCardProps) {
  const style = CARD_STYLES[account.type] ?? CARD_STYLES.checking;

  return (
    <div className={`group relative w-full max-w-sm h-48 rounded-2xl bg-gradient-to-br ${style.gradient} p-5 shadow-2xl overflow-hidden select-none`}>
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-14 -left-8 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />

      {/* Edit button — visible on hover */}
      <button
        onClick={() => onEdit(account)}
        className={`absolute top-3 right-3 z-20 p-1.5 rounded-full bg-white/10 hover:bg-white/25 transition-opacity opacity-0 group-hover:opacity-100 ${style.textColor}`}
        aria-label="Edit account"
      >
        <Pencil size={13} />
      </button>

      {/* Top row: chip + type label */}
      <div className="relative z-10 flex items-start justify-between pr-6">
        {/* EMV Chip */}
        <div className={`w-10 h-7 rounded-md bg-gradient-to-br ${style.chipColor} shadow-md flex items-center justify-center`}>
          <div className="w-7 h-5 rounded-[3px] border border-yellow-600/40 grid grid-cols-3 grid-rows-3 gap-[2px] p-[2px]">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-yellow-600/40 rounded-[1px]" />
            ))}
          </div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${style.textColor} opacity-70`}>
          {TYPE_LABEL[account.type] ?? account.type}
        </span>
      </div>

      {/* Balance */}
      <div className="relative z-10 mt-4">
        <p className={`text-[10px] uppercase tracking-widest ${style.textColor} opacity-50`}>Balance</p>
        <p className={`text-2xl font-bold ${style.textColor} leading-tight`}>
          ${account.balance.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          <span className={`text-xs ml-1.5 ${style.textColor} opacity-60`}>{account.currency}</span>
        </p>
      </div>

      {/* Bottom row: name + icon */}
      <div className="absolute bottom-5 left-5 right-5 z-10 flex items-end justify-between">
        <p className={`text-sm font-semibold tracking-wide ${style.textColor} truncate pr-4`}>
          {account.name}
        </p>
        <CreditCard size={22} className={`${style.textColor} opacity-40 shrink-0`} />
      </div>
    </div>
  );
}

export default function Accounts() {
  const snackbar = useSnackbar();
  const snackbarRef = useRef(snackbar);
  snackbarRef.current = snackbar;

  const [ accounts, setAccounts ] = useState<Account[]>([]);
  const [ isLoading, setIsLoading ] = useState(true);
  const [ isModalOpen, setIsModalOpen ] = useState(false);
  const [ isSubmitting, setIsSubmitting ] = useState(false);
  const [ editingAccount, setEditingAccount ] = useState<Account | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateAccountDto>({
    defaultValues: { name: "",
      type: "checking" },
  });

  const selectedType = watch("type");
  const isEditMode = editingAccount !== null;

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await accountService.getAll();
      setAccounts(res.data ?? []);
    } catch (error) {
      snackbarRef.current.error({
        title: "Failed to load accounts",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [ fetchAccounts ]);

  const handleOpenCreate = () => {
    setEditingAccount(null);
    reset({ name: "",
      type: "checking" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (account: Account) => {
    setEditingAccount(account);
    reset({ name: account.name,
      type: account.type });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
    reset({ name: "",
      type: "checking" });
  };

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await accountService.update(editingAccount.id, data);
        snackbar.success({
          title: "Account updated",
          description: `"${data.name}" has been updated.`,
        });
      } else {
        await accountService.create(data);
        snackbar.success({
          title: "Account created",
          description: `"${data.name}" has been created successfully.`,
        });
      }
      handleCloseModal();
      fetchAccounts();
    } catch (error) {
      snackbar.error({
        title: isEditMode ? "Failed to update account" : "Failed to create account",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Accounts</h2>
          <p className="text-muted-foreground">Manage your bank and financial accounts.</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Account
        </Button>
      </div>

      {/* Cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-full max-w-sm h-48 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground gap-4">
          <Wallet size={48} className="opacity-30" />
          <p className="text-lg font-medium">No accounts yet</p>
          <p className="text-sm">Create your first account to start tracking your finances.</p>
          <Button variant="outline" onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Account
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} onEdit={handleOpenEdit} />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={isEditMode ? "Edit Account" : "New Account"}
      >
        <form onSubmit={onSubmit} className="px-6 pb-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? "Update the name or type of your account."
              : "The account will start with a balance of $0 in MXN."}
          </p>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              placeholder="e.g. Mi cuenta BBVA"
              {...register("name", { required: "Name is required" })}
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

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode ? "Saving..." : "Creating..."
                : isEditMode ? "Save Changes" : "Create Account"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
