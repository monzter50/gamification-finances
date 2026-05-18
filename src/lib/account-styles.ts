/**
 * Account card decorative styles.
 *
 * These are intentional brand-style visuals for the credit-card-like account
 * tiles on the Accounts page — analogous to how Visa / Amex / Mastercard each
 * have a distinct color identity. They are NOT general-purpose tokens.
 *
 * Rules:
 *  - Only the Accounts page should import this.
 *  - Don't reuse these classes for non-card UI; use semantic tokens instead.
 *  - Adding a new account type? Add a new entry here, not inline.
 *
 * The raw Tailwind palettes are isolated to this file so the lint guard
 * (no-restricted-syntax in .eslintrc.json) only needs one eslint-disable for
 * the whole concept.
 */

import type { AccountType } from "@/types/api";

export interface AccountCardStyle {
  gradient: string;
  textColor: string;
  chipColor: string;
}

/* eslint-disable no-restricted-syntax -- decorative brand palette; see file header */
export const ACCOUNT_CARD_STYLES: Record<AccountType, AccountCardStyle> = {
  checking: {
    gradient: "from-blue-600 via-blue-700 to-blue-900",
    textColor: "text-blue-50",
    chipColor: "from-yellow-300 to-yellow-500",
  },
  savings: {
    gradient: "from-emerald-500 via-emerald-600 to-emerald-900",
    textColor: "text-emerald-50",
    chipColor: "from-yellow-300 to-yellow-500",
  },
  credit_card: {
    gradient: "from-slate-600 via-slate-700 to-slate-950",
    textColor: "text-slate-50",
    chipColor: "from-yellow-300 to-yellow-500",
  },
  vales: {
    gradient: "from-orange-500 via-orange-600 to-orange-900",
    textColor: "text-orange-50",
    chipColor: "from-yellow-300 to-yellow-500",
  },
};
/* eslint-enable no-restricted-syntax */

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking:    "Checking",
  savings:     "Savings",
  credit_card: "Credit Card",
  vales:       "Vales",
};
