import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * XPProgressBar — progress toward next level.
 * Independent of shadcn <Progress> because gamification has its own visual
 * language (xp token, optional label, gradient fill).
 *
 *   <XPProgressBar current={420} max={1000} level={5} />
 */

export interface XPProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  current: number;
  max: number;
  /** Optional level number — shown as "Lv. N → N+1" caption. */
  level?: number;
  /** Hide the label row above the bar. */
  hideLabel?: boolean;
}

export const XPProgressBar = React.forwardRef<HTMLDivElement, XPProgressBarProps>(
  ({ current, max, level, hideLabel, className, ...rest }, ref) => {
    const pct = max > 0 ? Math.min(100, Math.max(0, (current / max) * 100)) : 0;

    return (
      <div ref={ref} className={cn("w-full", className)} {...rest}>
        {!hideLabel ? (
          <div className="flex items-baseline justify-between mb-1.5 text-xs">
            <span className="text-muted-foreground">
              {level !== undefined ? `Lv. ${level} → ${level + 1}` : "XP"}
            </span>
            <span className="font-mono tabular-nums text-foreground font-medium">
              {current} / {max} XP
            </span>
          </div>
        ) : null}
        <div
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={level !== undefined ? `Level ${level} progress` : "XP progress"}
          className="relative h-2 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full bg-xp transition-[width] duration-base ease-standard"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  },
);
XPProgressBar.displayName = "XPProgressBar";
