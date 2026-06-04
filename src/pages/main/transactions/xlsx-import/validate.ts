import type { TxRowErrors } from "./types";
import type { XlsxImportState } from "./useXlsxReducer";

export interface IncomeRowErrors {
  description?: string;
  amount?: string;
  type?: string;
  accountId?: string;
}

export interface ExpenseRowErrors {
  description?: string;
  amount?: string;
}

export interface XlsxValidation {
  valid: boolean;
  txErrors: Record<string, TxRowErrors>;
  incomeErrors: Record<string, IncomeRowErrors>;
  expenseErrors: Record<string, ExpenseRowErrors>;
  batchError?: string;
}

const positive = (n: number) => !Number.isNaN(n) && n > 0;

export const validateXlsx = (state: XlsxImportState): XlsxValidation => {
  const txErrors: Record<string, TxRowErrors> = {};
  for (const row of state.transactions) {
    const e: TxRowErrors = {};
    if (!row.vendor.trim()) { e.vendor = "Vendor is required"; }
    if (!positive(row.amount)) { e.amount = "Amount must be greater than 0"; }
    if (!row.date || Number.isNaN(new Date(row.date).getTime())) { e.date = "A valid date is required"; }
    if (Object.keys(e).length) { txErrors[row._id] = e; }
  }

  const incomeErrors: Record<string, IncomeRowErrors> = {};
  for (const item of state.incomeItems) {
    const e: IncomeRowErrors = {};
    if (!item.description.trim()) { e.description = "Required"; }
    if (!positive(item.amount)) { e.amount = "> 0"; }
    if (!item.type) { e.type = "Pick a type"; }
    if (!item.accountId) { e.accountId = "Pick an account"; }
    if (Object.keys(e).length) { incomeErrors[item._id] = e; }
  }

  const expenseErrors: Record<string, ExpenseRowErrors> = {};
  for (const item of state.expenseItems) {
    const e: ExpenseRowErrors = {};
    if (!item.description.trim()) { e.description = "Required"; }
    if (!positive(item.amount)) { e.amount = "> 0"; }
    if (Object.keys(e).length) { expenseErrors[item._id] = e; }
  }

  // Payment sources still present in the transactions must be mapped.
  const usedSources = Array.from(
    new Set(state.transactions.map((r) => r.paymentSource).filter((s): s is string => Boolean(s))),
  );
  const unmapped = usedSources.filter((s) => !state.accountMapping[s]);

  const nothingToImport =
    state.transactions.length === 0 && state.incomeItems.length === 0 && state.expenseItems.length === 0;

  let batchError: string | undefined;
  if (nothingToImport) {
    batchError = "Nothing to import.";
  } else if (!state.budgetId) {
    batchError = "Select a budget.";
  } else if (!state.defaultAccountId) {
    batchError = "Select a default account.";
  } else if (unmapped.length > 0) {
    batchError = `Map an account for: ${unmapped.join(", ")}.`;
  }

  const valid =
    !batchError &&
    !Object.keys(txErrors).length &&
    !Object.keys(incomeErrors).length &&
    !Object.keys(expenseErrors).length;

  return { valid,
    txErrors,
    incomeErrors,
    expenseErrors,
    ...(batchError ? { batchError } : {}) };
};
