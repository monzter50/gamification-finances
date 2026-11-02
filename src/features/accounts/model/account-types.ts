import type { AccountType } from "@/types/api";

// TODO(i18n): labels
export const ACCOUNT_TYPE_OPTIONS: readonly { value: AccountType; label: string }[] = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "credit_card", label: "Credit Card" },
  { value: "vales", label: "Vales" },
];

export const DEFAULT_CURRENCY = "MXN";
