import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Money — single source of truth for rendering currency amounts.
 *
 * Why a component?
 *  - One place to enforce locale/currency formatting.
 *  - Color is semantic (income/expense/neutral) and theme-aware.
 *  - Always uses tabular-nums so columns of numbers line up.
 *
 * Use this anywhere you render a balance, transaction amount, KPI, etc.
 * Do NOT call `Intl.NumberFormat` ad-hoc in feature code — extend this.
 */

export type MoneyTone = "neutral" | "income" | "expense" | "auto";
export type MoneySize = "sm" | "md" | "lg";

export interface MoneyProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Amount in major units (e.g. 12.34 for $12.34). Use cents/minor units? Convert before passing. */
  value: number;
  /** ISO 4217 code. Defaults to USD — wire to user locale via a context when ready. */
  currency?: string;
  /** BCP-47 locale. Defaults to browser/user setting. */
  locale?: string;
  /**
   * Color intent:
   *  - "auto"    → positive = income green, negative = expense red, zero = neutral
   *  - "income"  → always green (e.g. inside an Income KPI even if 0)
   *  - "expense" → always red
   *  - "neutral" → foreground (default for balances that aren't deltas)
   */
  tone?: MoneyTone;
  /** Force a +/- sign (good for deltas in tables). */
  signed?: boolean;
  /** Visual size — pairs with the `money-*` font scale. */
  size?: MoneySize;
}

// Tone resolver — only `auto` actually consults the value, but every tone
// gets the same signature so the lookup table stays uniform.
// eslint-disable-next-line no-unused-vars
const toneClass: Record<MoneyTone, (v: number) => string> = {
  neutral: () => "text-foreground",
  income: () => "text-income",
  expense: () => "text-expense",
  auto: (v) => (v > 0 ? "text-income" : v < 0 ? "text-expense" : "text-muted-foreground"),
};

const sizeClass: Record<MoneySize, string> = {
  sm: "text-money-sm",
  md: "text-money-md",
  lg: "text-money-lg",
};

export const Money = React.forwardRef<HTMLSpanElement, MoneyProps>(
  ({ value, currency = "USD", locale, tone = "neutral", signed = false, size = "md", className, ...rest }, ref) => {
    // <Money> is the single sanctioned place for Intl.NumberFormat currency.
    /* eslint-disable no-restricted-syntax */
    const formatter = React.useMemo(
      () =>
        new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
          signDisplay: signed ? "exceptZero" : "auto",
        }),
      [locale, currency, signed],
    );
    /* eslint-enable no-restricted-syntax */

    return (
      <span
        ref={ref}
        // a11y: screen readers read "negative twelve dollars" not "minus sign 12"
        aria-label={formatter.format(value)}
        className={cn("font-mono tabular-nums font-medium", sizeClass[size], toneClass[tone](value), className)}
        {...rest}
      >
        {formatter.format(value)}
      </span>
    );
  },
);
Money.displayName = "Money";
