import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * TxTypePill — small intent-colored label for transaction type.
 * Use this anywhere you'd otherwise write `<span>Income</span>` with
 * hand-rolled green/red colors.
 */

const pillVariants = cva(
  "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide",
  {
    variants: {
      type: {
        income: "bg-income-subtle text-income",
        expense: "bg-expense-subtle text-expense",
        savings: "bg-savings-subtle text-savings",
        neutral: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { type: "neutral" },
  },
);

export interface TxTypePillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof pillVariants> {
  /** Override the rendered label. Defaults to the capitalized type name. */
  label?: string;
}

export const TxTypePill = React.forwardRef<HTMLSpanElement, TxTypePillProps>(
  ({ type = "neutral", label, className, children, ...rest }, ref) => (
    <span ref={ref} className={cn(pillVariants({ type }), className)} {...rest}>
      {children ?? label ?? type}
    </span>
  ),
);
TxTypePill.displayName = "TxTypePill";
