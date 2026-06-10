import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * MoneyInput — controlled currency-aware input.
 *
 * Surface area is intentionally small:
 *  - `value`     — number in major units (e.g. 12.34). `null` for empty.
 *  - `onChange`  — fires with the parsed number, or `null` when cleared.
 *  - `currency`  — used only to render the symbol prefix.
 *
 * Plays nicely with react-hook-form via Controller:
 *
 *   <Controller
 *     control={control}
 *     name="amount"
 *     render={({ field }) => (
 *       <MoneyInput value={field.value ?? null} onChange={field.onChange} currency="MXN" />
 *     )}
 *   />
 *
 * Why not parse inside <Input>?  Keeps <Input> generic; this component owns
 * the number ↔ string contract.
 */

export interface MoneyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value: number | null;
  // eslint-disable-next-line no-unused-vars
  onChange: (value: number | null) => void;
  currency?: string;
  /** BCP-47 locale used for the symbol. */
  locale?: string;
  /** Decimal places to enforce on blur. */
  fractionDigits?: number;
}

/** Symbol-only formatter — strips digits, returns "$" / "€" / "MX$". */
const getCurrencySymbol = (currency: string, locale?: string): string => {
  try {
    // The design system itself is the one place currency formatting is allowed.
    // eslint-disable-next-line no-restricted-syntax
    const parts = new Intl.NumberFormat(locale, { style: "currency", currency }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value ?? currency;
  } catch {
    return currency;
  }
};

const sanitize = (raw: string): string => {
  // Allow digits, one dot, optional leading minus.
  let cleaned = raw.replace(/[^\d.-]/g, "");
  // Collapse multiple dots → keep the first.
  const firstDot = cleaned.indexOf(".");
  if (firstDot !== -1) {
    cleaned =
      cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
  }
  // Minus only at position 0.
  cleaned = cleaned.replace(/(?!^)-/g, "");
  return cleaned;
};

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  (
    {
      value,
      onChange,
      currency = "USD",
      locale,
      fractionDigits = 2,
      className,
      onBlur,
      ...rest
    },
    ref,
  ) => {
    const symbol = React.useMemo(() => getCurrencySymbol(currency, locale), [currency, locale]);

    // Mirror the numeric `value` as a string for editing.
    const [display, setDisplay] = React.useState<string>(value === null ? "" : String(value));

    // Keep display in sync when parent resets the value (e.g. form.reset()).
    React.useEffect(() => {
      setDisplay(value === null || value === undefined ? "" : String(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleaned = sanitize(e.target.value);
      setDisplay(cleaned);
      if (cleaned === "" || cleaned === "-" || cleaned === ".") {
        onChange(null);
        return;
      }
      const parsed = Number(cleaned);
      onChange(Number.isFinite(parsed) ? parsed : null);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (display !== "" && Number.isFinite(Number(display))) {
        const formatted = Number(display).toFixed(fractionDigits);
        setDisplay(formatted);
        onChange(Number(formatted));
      }
      onBlur?.(e);
    };

    return (
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono tabular-nums pointer-events-none"
          aria-hidden
        >
          {symbol}
        </span>
        <Input
          ref={ref}
          type="text"
          inputMode="decimal"
          value={display}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn("pl-9 font-mono tabular-nums text-right", className)}
          {...rest}
        />
      </div>
    );
  },
);
MoneyInput.displayName = "MoneyInput";
