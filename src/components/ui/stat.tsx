import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Money, type MoneyTone } from "@/components/ui/money";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Stat — KPI card for finance dashboards.
 *
 * Pattern usage:
 *   <Stat label="This month" value={2340.55} tone="auto" delta={{ value: 120, percent: 5.4 }} />
 *
 * Composition over props: anything more exotic, wrap a <Card> yourself.
 */

export interface StatDelta {
  /** Absolute change (same currency as value). */
  value: number;
  /** Optional percent change. Pass already-computed; we don't infer from value. */
  percent?: number;
  /** Override direction inference (e.g. for budgets where "less spent" = good). */
  direction?: "up" | "down" | "flat";
  /** "up" is good (income) by default. Flip for expenses/budgets. */
  goodWhen?: "up" | "down";
}

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: number;
  currency?: string;
  tone?: MoneyTone;
  delta?: StatDelta;
  icon?: React.ReactNode;
  /** When true, renders a same-shape skeleton instead of value/delta. */
  loading?: boolean;
}

const directionOf = (n: number): "up" | "down" | "flat" =>
  n > 0 ? "up" : n < 0 ? "down" : "flat";

export const Stat = React.forwardRef<HTMLDivElement, StatProps>(
  ({ label, value, currency, tone = "neutral", delta, icon, loading, className, ...rest }, ref) => {
    const dir = delta?.direction ?? (delta ? directionOf(delta.value) : "flat");
    const goodWhen = delta?.goodWhen ?? "up";
    const isGood = dir === "flat" ? null : (dir === goodWhen);

    const DeltaIcon = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : Minus;
    const deltaColor =
      isGood === null ? "text-muted-foreground" : isGood ? "text-income" : "text-expense";

    return (
      <Card ref={ref} className={cn("overflow-hidden", className)} {...rest}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            {icon ? <span className="text-muted-foreground">{icon}</span> : null}
          </div>
          {loading ? (
            <>
              <Skeleton className="h-8 w-32 mt-2" />
              {delta !== undefined ? <Skeleton className="h-4 w-24 mt-3" /> : null}
            </>
          ) : (
            <>
              <div className="mt-2">
                <Money value={value} currency={currency} tone={tone} size="lg" />
              </div>
              {delta ? (
                <div className={cn("mt-3 flex items-center gap-1 text-sm", deltaColor)}>
                  <DeltaIcon className="h-4 w-4" aria-hidden />
                  <span className="tabular-nums">
                    {delta.percent !== undefined
                      ? `${delta.percent > 0 ? "+" : ""}${delta.percent.toFixed(1)}%`
                      : <Money value={delta.value} currency={currency} tone="auto" size="sm" signed />}
                  </span>
                  <span className="text-muted-foreground">vs. last period</span>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    );
  },
);
Stat.displayName = "Stat";
