import { cva } from "class-variance-authority";

/**
 * Shared look for Notion-style inline cells (InlineText, InlineMoney,
 * InlineSelect): plain text at rest, a soft fill on hover, a focus ring on
 * keyboard focus. `min-h-10` keeps a 40px touch target on mobile.
 */
export const inlineCellVariants = cva(
  "flex min-h-10 w-full min-w-0 items-center gap-1 rounded-md px-2 text-sm text-foreground transition-colors duration-fast ease-standard hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      align: {
        start: "justify-start text-left",
        end: "justify-end text-right",
      },
    },
    defaultVariants: { align: "start" },
  },
);
