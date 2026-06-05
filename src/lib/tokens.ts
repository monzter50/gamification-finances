/**
 * Token map for non-Tailwind contexts.
 *
 * Use Tailwind classes (`bg-income`, `text-xp`) in JSX. Use this file when a
 * className doesn't fit — chart fills, inline SVG, canvas, dynamic styles
 * computed at runtime. Each entry resolves the same CSS variable so dark mode
 * still works.
 *
 *   <Bar fill={color("income")} />
 *   <Cell stroke={color("expense", 0.3)} />
 */

export type SemanticColor =
  | "background"
  | "foreground"
  | "muted"
  | "muted-foreground"
  | "border"
  | "primary"
  | "secondary"
  | "accent"
  | "destructive"
  // intent
  | "success"
  | "warning"
  | "info"
  | "danger"
  // finance
  | "income"
  | "expense"
  | "savings"
  // gamification
  | "xp"
  | "level"
  | "streak"
  // charts
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5";

/** Build an `hsl(var(--token) / alpha)` string. */
export const color = (token: SemanticColor, alpha = 1): string =>
  alpha === 1
    ? `hsl(var(--${token}))`
    : `hsl(var(--${token}) / ${alpha})`;

/** Recharts-friendly fills, in narrative order (income first). */
export const chartPalette = {
  income: color("income"),
  expense: color("expense"),
  savings: color("savings"),
  series: [color("chart-1"), color("chart-2"), color("chart-3"), color("chart-4"), color("chart-5")],
} as const;

export const duration = {
  instant: 75,
  fast: 150,
  base: 200,
  slow: 300,
} as const;
