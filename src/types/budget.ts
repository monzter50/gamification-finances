// Budget Type Definitions

export type IncomeType =
  | "Debit Card"
  | "Credit Card"
  | "Cash"
  | "Vales"
  | "Transfer"
  | "Check"
  | "Other";

export type ExpenseType = "Fixed" | "Variable";

export interface IncomeItem {
  _id?: string;
  description: string;
  amount: number;
  type: IncomeType;
}

export interface ExpenseItem {
  _id?: string;
  description: string;
  amount: number;
  type: ExpenseType;
}

export interface Budget {
  id: string;
  userId: string;
  year: number;
  month: number;
  incomeItems: IncomeItem[];
  expenseItems: ExpenseItem[];
  createdAt: string;
  updatedAt: string;
  // Virtual properties
  totalIncome?: number;
  totalExpense?: number;
  netSavings?: number;
  savingsRate?: number;
}

export interface CreateBudgetDTO {
  year: number;
  month: number;
  incomeItems?: IncomeItem[];
  expenseItems?: ExpenseItem[];
}

export interface AddIncomeItemDTO {
  description: string;
  amount: number;
  type: IncomeType;
}

export interface AddExpenseItemDTO {
  description: string;
  amount: number;
  type: ExpenseType;
}

export interface BudgetStats {
  totalBudgets: number;
  currentMonthBudget?: Budget;
  yearlyTotals: {
    [year: number]: {
      income: number;
      expense: number;
      savings: number;
    };
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export const INCOME_TYPES: IncomeType[] = [
  "Debit Card",
  "Credit Card",
  "Cash",
  "Vales",
  "Transfer",
  "Check",
  "Other",
];

export const EXPENSE_TYPES: ExpenseType[] = [
  "Fixed",
  "Variable",
];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
