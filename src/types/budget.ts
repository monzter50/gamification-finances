// Budget Type Definitions

export type IncomeType =
  | "Debit Card"
  | "Credit Card"
  | "Cash"
  | "Vales"
  | "Transfer"
  | "Check"
  | "Other";

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
}

export interface Budget {
  _id: string;
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

export const INCOME_TYPES: IncomeType[] = [
  "Debit Card",
  "Credit Card",
  "Cash",
  "Vales",
  "Transfer",
  "Check",
  "Other",
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
