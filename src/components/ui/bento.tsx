import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Bento layout primitives — the 12-column grid from the brand brief.
 *
 * Why a component?
 *  - One place enforces the 24px gutter (`gap-gutter`) and the responsive
 *    collapse (single column on mobile → 12 columns from `md` up).
 *  - Item spans are constrained to the sanctioned set (4/6/7/8/12) so layouts
 *    stay on-grid instead of ad-hoc `col-span-[…]`.
 *
 * Usage:
 *   <BentoGrid>
 *     <BentoItem span={8}><Card>…</Card></BentoItem>
 *     <BentoItem span={4}><Card>…</Card></BentoItem>
 *     <BentoItem span={12}><Card>…</Card></BentoItem>
 *   </BentoGrid>
 */

export const BentoGrid = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("grid grid-cols-1 gap-gutter md:grid-cols-bento", className)}
      {...props}
    />
  ),
);
BentoGrid.displayName = "BentoGrid";

/** Allowed column spans on the 12-col grid. */
export type BentoSpan = 4 | 6 | 7 | 8 | 12;
/** Allowed row spans for tall tiles. */
export type BentoRows = 1 | 2;

// Full literal class names so Tailwind's JIT scanner keeps them.
const SPAN_CLASS: Record<BentoSpan, string> = {
  4: "md:col-span-4",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
  12: "md:col-span-12",
};

const ROW_CLASS: Record<BentoRows, string> = {
  1: "",
  2: "md:row-span-2",
};

export interface BentoItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Columns to span on the 12-col grid (md+). Defaults to full width. */
  span?: BentoSpan;
  /** Rows to span for tall tiles. Defaults to 1. */
  rows?: BentoRows;
}

export const BentoItem = React.forwardRef<HTMLDivElement, BentoItemProps>(
  ({ span = 12, rows = 1, className, ...props }, ref) => (
    <div ref={ref} className={cn(SPAN_CLASS[span], ROW_CLASS[rows], className)} {...props} />
  ),
);
BentoItem.displayName = "BentoItem";
