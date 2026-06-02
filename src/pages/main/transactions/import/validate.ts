import type { RowErrors } from "./types";
import type { ImportState } from "./useImportReducer";

export interface BatchValidation {
  valid: boolean;
  rowErrors: Record<string, RowErrors>;
  batchError?: string;
}

/**
 * Pure validation of the reviewed batch before /confirm. Mirrors the server
 * rules (vendor non-empty, amount > 0, valid date). The backend always requires
 * a batch budget + account (per-row account override is extra, not a
 * replacement), so both are required here too.
 */
export const validateBatch = (state: ImportState): BatchValidation => {
  const rowErrors: Record<string, RowErrors> = {};

  for (const row of state.rows) {
    const errors: RowErrors = {};

    if (!row.vendor.trim()) {
      errors.vendor = "Vendor is required";
    }
    if (!(typeof row.amount === "number") || Number.isNaN(row.amount) || row.amount <= 0) {
      errors.amount = "Amount must be greater than 0";
    }
    if (!row.date || Number.isNaN(new Date(row.date).getTime())) {
      errors.date = "A valid date is required";
    }

    if (Object.keys(errors).length > 0) {
      rowErrors[row._id] = errors;
    }
  }

  let batchError: string | undefined;

  if (state.rows.length === 0) {
    batchError = "Add at least one transaction to import.";
  } else if (!state.budgetId) {
    batchError = "Select a budget for these transactions.";
  } else if (!state.accountId) {
    batchError = "Select an account for these transactions.";
  }

  return {
    valid: Object.keys(rowErrors).length === 0 && !batchError,
    rowErrors,
    ...(batchError ? { batchError } : {}),
  };
};
