import { MONTHS, type Budget } from "@/types/budget";

/** Budgets are planned in MXN until accounts drive the currency. */
export const BUDGET_CURRENCY = "MXN";

/** "May 2026" — `month` is 0-based. */
export const periodLabel = ({ year, month }: Pick<Budget, "year" | "month">): string =>
  `${MONTHS[month]} ${year}`;
