import { useReducer } from "react";

import type {
  ExpenseItemType,
  ParsedTransaction,
  ParseResponseData,
  ReviewExpenseItem,
  ReviewIncomeItem,
  ReviewTransaction,
} from "./types";

export type XlsxStatus = "idle" | "uploading" | "reviewing" | "submitting";

export interface XlsxImportState {
  status: XlsxStatus;
  transactions: ReviewTransaction[];
  incomeItems: ReviewIncomeItem[];
  expenseItems: ReviewExpenseItem[];
  paymentSources: string[];
  budgetId: string | null;
  defaultAccountId: string | null;
  accountMapping: Record<string, string>;
  fileName?: string;
  error: string | null;
}

export type XlsxAction =
  | { type: "UPLOAD_START"; fileName: string }
  | { type: "PARSE_SUCCESS"; data: ParseResponseData }
  | { type: "PARSE_ERROR"; message: string }
  | { type: "EDIT_TX"; id: string; patch: Partial<ParsedTransaction> }
  | { type: "DELETE_TX"; id: string }
  | { type: "EDIT_INCOME"; id: string; patch: Partial<ReviewIncomeItem> }
  | { type: "DELETE_INCOME"; id: string }
  | { type: "EDIT_EXPENSE"; id: string; patch: Partial<ReviewExpenseItem> }
  | { type: "DELETE_EXPENSE"; id: string }
  | { type: "SET_BUDGET"; budgetId: string }
  | { type: "SET_DEFAULT_ACCOUNT"; accountId: string }
  | { type: "SET_SOURCE_MAPPING"; source: string; accountId: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_ERROR"; message: string }
  | { type: "RESET" };

export const initialXlsxState: XlsxImportState = {
  status: "idle",
  transactions: [],
  incomeItems: [],
  expenseItems: [],
  paymentSources: [],
  budgetId: null,
  defaultAccountId: null,
  accountMapping: {},
  error: null,
};

const id = () => crypto.randomUUID();

export const xlsxReducer = (state: XlsxImportState, action: XlsxAction): XlsxImportState => {
  switch (action.type) {
  case "UPLOAD_START":
    return { ...initialXlsxState,
      status: "uploading",
      fileName: action.fileName };

  case "PARSE_SUCCESS":
    return {
      ...state,
      status: "reviewing",
      transactions: action.data.transactions.map((t) => ({ ...t,
        _id: id() })),
      // Income items start with no type/account — the user maps each in review.
      incomeItems: action.data.incomeItems.map((i) => ({ ...i,
        _id: id(),
        type: "",
        accountId: "" })),
      expenseItems: action.data.expenseItems.map((e) => ({ ...e,
        _id: id() })),
      paymentSources: action.data.paymentSources,
      error: null,
    };

  case "PARSE_ERROR":
    return { ...initialXlsxState,
      status: "idle",
      error: action.message };

  case "EDIT_TX":
    return { ...state,
      transactions: state.transactions.map((r) => (r._id === action.id ? { ...r,
        ...action.patch } : r)) };
  case "DELETE_TX":
    return { ...state,
      transactions: state.transactions.filter((r) => r._id !== action.id) };

  case "EDIT_INCOME":
    return { ...state,
      incomeItems: state.incomeItems.map((r) => (r._id === action.id ? { ...r,
        ...action.patch } : r)) };
  case "DELETE_INCOME":
    return { ...state,
      incomeItems: state.incomeItems.filter((r) => r._id !== action.id) };

  case "EDIT_EXPENSE":
    return { ...state,
      expenseItems: state.expenseItems.map((r) => (r._id === action.id ? { ...r,
        ...action.patch } : r)) };
  case "DELETE_EXPENSE":
    return { ...state,
      expenseItems: state.expenseItems.filter((r) => r._id !== action.id) };

  case "SET_BUDGET":
    return { ...state,
      budgetId: action.budgetId };
  case "SET_DEFAULT_ACCOUNT":
    return { ...state,
      defaultAccountId: action.accountId };
  case "SET_SOURCE_MAPPING":
    return { ...state,
      accountMapping: { ...state.accountMapping,
        [action.source]: action.accountId } };

  case "SUBMIT_START":
    return { ...state,
      status: "submitting",
      error: null };
  case "SUBMIT_ERROR":
    return { ...state,
      status: "reviewing",
      error: action.message };
  case "RESET":
    return initialXlsxState;

  default:
    return state;
  }
};

export type { ExpenseItemType };
export const useXlsxReducer = () => useReducer(xlsxReducer, initialXlsxState);
