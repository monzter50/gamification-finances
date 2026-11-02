import { useForm } from "react-hook-form";

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Modal } from "@/components/ui/Modal";
import { useCreateAccount, useUpdateAccount } from "@/features/accounts/api/useAccountMutations";
import { ACCOUNT_TYPE_OPTIONS, DEFAULT_CURRENCY } from "@/features/accounts/model/account-types";
import type { Account, AccountType, CreateAccountDto } from "@/types/api";

export interface AccountFormModalProps {
  /** Account to edit; omit to create. Mount the modal only while open so defaults reset. */
  account?: Account;
  onClose: () => void;
}

interface FormValues {
  name: string;
  type: AccountType;
  balance?: number;
  currency?: string;
}

const toPayload = (v: FormValues): CreateAccountDto => ({
  name: v.name.trim(),
  type: v.type,
  ...(typeof v.balance === "number" && !Number.isNaN(v.balance) ? { balance: v.balance } : {}),
  ...(v.currency?.trim() ? { currency: v.currency.trim().toUpperCase() } : {}),
});

export const AccountFormModal = ({ account, onClose }: AccountFormModalProps) => {
  const isEdit = account != null;
  const create = useCreateAccount();
  const update = useUpdateAccount();
  const isPending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: account
      ? {
          name: account.name,
          type: account.type,
          balance: account.balance,
          currency: account.currency,
        }
      : { name: "", type: "checking", balance: 0, currency: DEFAULT_CURRENCY },
  });

  const handleSave = handleSubmit((values) => {
    const dto = toPayload(values);
    if (account) {
      update.mutate({ id: account.id, dto }, { onSuccess: onClose });
    } else {
      create.mutate(dto, { onSuccess: onClose });
    }
  });

  return (
    <Modal open onClose={onClose} title={isEdit ? "Edit Account" : "New Account"}>
      <form onSubmit={handleSave} className="px-6 pb-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Update your account details. Balance edits should be rare — prefer transactions."
            : "Create an account to track balances. The opening balance is optional."}
        </p>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="account-name">Account Name</Label>
          <Input
            id="account-name"
            placeholder="e.g. Mi cuenta BBVA"
            aria-invalid={errors.name ? true : undefined}
            {...register("name", {
              required: "Name is required",
              minLength: { value: 2, message: "At least 2 characters" },
            })}
          />
          {errors.name && <p className="text-danger text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="account-type">Account Type</Label>
          <Select
            value={watch("type")}
            onValueChange={(value) =>
              setValue("type", value as AccountType, { shouldValidate: true })
            }
          >
            <SelectTrigger id="account-type">
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              {ACCOUNT_TYPE_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="account-balance">{isEdit ? "Balance" : "Opening balance"}</Label>
            <Input
              id="account-balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="tabular-nums"
              {...register("balance", { valueAsNumber: true })}
            />
            {isEdit && (
              <p className="text-[11px] text-muted-foreground">
                Direct balance edits bypass transaction history.
              </p>
            )}
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="account-currency">Currency</Label>
            <Input
              id="account-currency"
              placeholder={DEFAULT_CURRENCY}
              maxLength={3}
              aria-invalid={errors.currency ? true : undefined}
              {...register("currency", {
                pattern: { value: /^[A-Za-z]{3}$/, message: "3-letter ISO code" },
              })}
            />
            {errors.currency && (
              <p className="text-danger text-sm mt-1">{errors.currency.message}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
                ? "Save Changes"
                : "Create Account"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
