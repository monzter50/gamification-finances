import { useReducer } from "react";

import type {
  ExtractedTransaction,
  ExtractionSource,
  ExtractResponseData,
  ReviewRow,
} from "./types";

export type ImportStatus = "idle" | "uploading" | "reviewing" | "submitting";

export interface ImportState {
  status: ImportStatus;
  rows: ReviewRow[];
  budgetId: string | null;
  accountId: string | null;
  currencyHint?: string;
  source?: ExtractionSource;
  fileName?: string;
  error: string | null;
}

export type ImportAction =
  | { type: "UPLOAD_START"; fileName: string }
  | { type: "EXTRACT_SUCCESS"; data: ExtractResponseData }
  | { type: "EXTRACT_ERROR"; message: string }
  | { type: "EDIT_ROW"; id: string; patch: Partial<ExtractedTransaction> }
  | { type: "DELETE_ROW"; id: string }
  | { type: "SET_BATCH_BUDGET"; budgetId: string }
  | { type: "SET_BATCH_ACCOUNT"; accountId: string }
  | { type: "SET_ROW_OVERRIDE"; id: string; overrideAccountId?: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_ERROR"; message: string }
  | { type: "RESET" };

export const initialImportState: ImportState = {
  status:    "idle",
  rows:      [],
  budgetId:  null,
  accountId: null,
  error:     null,
};

/** Map extracted rows to review rows with stable client ids. */
const toReviewRows = (transactions: ExtractedTransaction[]): ReviewRow[] =>
  transactions.map((t) => ({ ...t,
    _id: crypto.randomUUID() }));

export const importReducer = (state: ImportState, action: ImportAction): ImportState => {
  switch (action.type) {
  case "UPLOAD_START":
    return { ...initialImportState,
      status: "uploading",
      fileName: action.fileName };

  case "EXTRACT_SUCCESS":
    return {
      ...state,
      status:       "reviewing",
      rows:         toReviewRows(action.data.transactions),
      currencyHint: action.data.currencyHint,
      source:       action.data.source,
      error:        null,
    };

  case "EXTRACT_ERROR":
    return { ...initialImportState,
      status: "idle",
      error: action.message };

  case "EDIT_ROW":
    return {
      ...state,
      rows: state.rows.map((r) => (r._id === action.id ? { ...r,
        ...action.patch } : r)),
    };

  case "DELETE_ROW":
    return { ...state,
      rows: state.rows.filter((r) => r._id !== action.id) };

  case "SET_BATCH_BUDGET":
    return { ...state,
      budgetId: action.budgetId };

  case "SET_BATCH_ACCOUNT":
    return { ...state,
      accountId: action.accountId };

  case "SET_ROW_OVERRIDE":
    return {
      ...state,
      rows: state.rows.map((r) =>
        r._id === action.id ? { ...r,
          overrideAccountId: action.overrideAccountId } : r,
      ),
    };

  case "SUBMIT_START":
    return { ...state,
      status: "submitting",
      error: null };

  case "SUBMIT_ERROR":
    // Stay on the review step with rows intact so the user can fix & retry.
    return { ...state,
      status: "reviewing",
      error: action.message };

  case "RESET":
    return initialImportState;

  default:
    return state;
  }
};

export const useImportReducer = () => useReducer(importReducer, initialImportState);
