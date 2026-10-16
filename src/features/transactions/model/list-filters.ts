import type { TransactionFilters, TransactionType } from "@/types/api";

/** The filter form's values. Empty strings mean "any". */
export interface TransactionListFilterValues {
  budgetId: string;
  type: "all" | TransactionType;
  /** yyyy-mm-dd */
  startDate: string;
  endDate: string;
}

export const DEFAULT_FILTERS: TransactionListFilterValues = {
  budgetId: "",
  type: "all",
  startDate: "",
  endDate: "",
};

export const hasActiveFilters = (values: TransactionListFilterValues): boolean =>
  values.budgetId !== "" ||
  values.type !== "all" ||
  values.startDate !== "" ||
  values.endDate !== "";

/** Form values → API filters, dropping the "any" values. */
export const toTransactionFilters = (
  values: TransactionListFilterValues,
): Omit<TransactionFilters, "page" | "limit"> => ({
  ...(values.budgetId && { budgetId: values.budgetId }),
  ...(values.type !== "all" && { type: values.type }),
  ...(values.startDate && { startDate: values.startDate }),
  ...(values.endDate && { endDate: values.endDate }),
});
