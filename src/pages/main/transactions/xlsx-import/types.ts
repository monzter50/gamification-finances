/**
 * Types for the Excel import flow. Mirrors the backend contract:
 *   POST /transactions/import/xlsx/parse    -> ParseResponseData (3 lists)
 *   POST /transactions/import/xlsx/confirm  -> ConfirmXlsxResult
 *
 * Workbook → app entities:
 *   "Budget track" → transactions, "Income" → income items, "Expenses" → expense items.
 */
export type TransactionType = "income" | "expense";
export type ExpenseItemType = "Fixed" | "Variable";

export interface ParsedTransaction {
  date: string;
  amount: number;
  vendor: string;
  type: TransactionType;
  description?: string;
  paymentSource?: string;
  category?: string;
}

export interface ParsedIncomeItem {
  description: string;
  amount: number;
}

export interface ParsedExpenseItem {
  description: string;
  amount: number;
  type: ExpenseItemType;
}

export interface ParseResponseData {
  transactions: ParsedTransaction[];
  incomeItems: ParsedIncomeItem[];
  expenseItems: ParsedExpenseItem[];
  paymentSources: string[];
  counts: { transactions: number; incomeItems: number; expenseItems: number };
}

// ---- Client-side review rows (with stable ids + editable fields) ----

export interface ReviewTransaction extends ParsedTransaction {
  _id: string;
}

/** Income item gains a user-chosen type + account in review. */
export interface ReviewIncomeItem extends ParsedIncomeItem {
  _id: string;
  type: string;       // "" until chosen
  accountId: string;  // "" until chosen
}

export interface ReviewExpenseItem extends ParsedExpenseItem {
  _id: string;
}

export interface TxRowErrors {
  date?: string;
  amount?: string;
  vendor?: string;
}

// ---- Confirm payload ----

export interface ConfirmIncomeItem {
  description: string;
  amount: number;
  type: string;
  accountId: string;
}

export interface ConfirmExpenseItem {
  description: string;
  amount: number;
  type: ExpenseItemType;
}

export interface ConfirmXlsxDto {
  budgetId: string;
  defaultAccountId: string;
  accountMapping: Record<string, string>;
  transactions: ParsedTransaction[];
  incomeItems: ConfirmIncomeItem[];
  expenseItems: ConfirmExpenseItem[];
}

export interface ConfirmXlsxResult {
  createdCount: { transactions: number; incomeItems: number; expenseItems: number };
  transactionIds: string[];
}
