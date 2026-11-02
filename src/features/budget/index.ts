/**
 * Budget feature — public API. Import from "@/features/budget" only.
 * Covers budgets (list, detail, create, duplicate) and their income/expense items.
 */
export {
  budgetDetailQuery,
  budgetsListQuery,
  useBudgetDetail,
  useBudgetsList,
} from "./api/budgetQueries";
export type { BudgetListFilters } from "./api/budgetFetchers";
export { useCreateBudget, useDuplicateBudget } from "./api/useBudgetMutations";
export {
  useAddExpenseItem,
  useAddIncomeItem,
  useDeleteExpenseItem,
  useDeleteIncomeItem,
  useUpdateExpenseItem,
  useUpdateIncomeItem,
} from "./api/useBudgetItemMutations";

export { BudgetOverview } from "./components/BudgetOverview";
export { BudgetPageShell, type BudgetPageShellProps } from "./components/BudgetPageShell";
export { BudgetsList } from "./components/BudgetsList";
export { CreateBudgetModal } from "./components/CreateBudgetModal";
export { DuplicateBudgetModal } from "./components/DuplicateBudgetModal";
export { ExpenseItemsSection } from "./components/ExpenseItemsSection";
export { IncomeItemsSection } from "./components/IncomeItemsSection";

export { calculateBudgetTotals } from "./model/budget-totals";
export { duplicateBudgetErrorCopy, type ErrorToastCopy } from "./model/duplicate-budget-errors";
export { BUDGET_CURRENCY, periodLabel } from "./model/period";
