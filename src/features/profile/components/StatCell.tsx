import type { ComponentType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Maps a cell to a semantic token, so a Flame icon is always "streak". */
export type StatCellTone = "streak" | "level" | "info" | "success" | "expense" | "savings" | "xp";

const TONE_CLASS: Record<StatCellTone, string> = {
  streak: "text-streak",
  level: "text-level",
  info: "text-info",
  success: "text-success",
  expense: "text-expense",
  savings: "text-savings",
  xp: "text-xp",
};

export interface StatCellProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  tone?: StatCellTone;
}

export const StatCell = ({ icon: Icon, label, value, tone }: StatCellProps) => {
  const toneClass = tone ? TONE_CLASS[tone] : "text-foreground";
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-background">
        <Icon className={cn("h-4 w-4", toneClass)} />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn("text-sm font-semibold", toneClass)}>{value}</span>
      </div>
    </div>
  );
};
