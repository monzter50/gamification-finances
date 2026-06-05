import { cva, type VariantProps } from "class-variance-authority";
import { Sparkles } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * LevelBadge — gamification "Lv. N" chip.
 * Uses --level token, so rebranding gamification = one CSS var.
 *
 *   <LevelBadge level={7} />
 *   <LevelBadge level={12} size="lg" tone="streak" />
 */

const badgeVariants = cva(
  "inline-flex items-center gap-1 font-semibold rounded-full",
  {
    variants: {
      tone: {
        level: "bg-level/10 text-level",
        xp: "bg-xp/15 text-xp",
        streak: "bg-streak/15 text-streak",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: { tone: "level", size: "md" },
  },
);

export interface LevelBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof badgeVariants> {
  level: number;
  /** Custom prefix (defaults to "Lv."). */
  prefix?: string;
  /** Show the sparkle icon. */
  showIcon?: boolean;
}

export const LevelBadge = React.forwardRef<HTMLSpanElement, LevelBadgeProps>(
  ({ level, prefix = "Lv.", tone, size, showIcon = true, className, ...rest }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ tone, size }), className)}
      aria-label={`Level ${level}`}
      {...rest}
    >
      {showIcon ? <Sparkles className="h-3 w-3" aria-hidden /> : null}
      {prefix} {level}
    </span>
  ),
);
LevelBadge.displayName = "LevelBadge";
