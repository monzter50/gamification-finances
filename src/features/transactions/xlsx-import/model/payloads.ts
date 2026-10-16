import type {
  ConfirmXlsxDto,
  ConfirmXlsxResult,
  ParseResponseData,
} from "@/features/transactions/xlsx-import/model/types";
import type { XlsxImportState } from "@/features/transactions/xlsx-import/model/xlsx-reducer";

/*
 * Boundary mapping between the review state and the generated client.
 * The spec marks every response field optional; the review step needs
 * complete lists, so missing ones become empty here (once).
 */

/** Parse response → complete lists (missing = none found in the workbook). */
export const toParseResult = (data: Partial<ParseResponseData> | undefined): ParseResponseData => {
  const transactions = data?.transactions ?? [];
  const incomeItems = data?.incomeItems ?? [];
  const expenseItems = data?.expenseItems ?? [];
  return {
    transactions,
    incomeItems,
    expenseItems,
    paymentSources: data?.paymentSources ?? [],
    counts: data?.counts ?? {
      transactions: transactions.length,
      incomeItems: incomeItems.length,
      expenseItems: expenseItems.length,
    },
  };
};

export interface ConfirmSummary {
  created: ConfirmXlsxResult["createdCount"];
  /** Rows the server skipped because the same row was already imported. */
  skippedTransactions: number;
}

export const toConfirmSummary = (
  data:
    | {
        createdCount?: Partial<ConfirmXlsxResult["createdCount"]>;
        skippedCount?: { transactions?: number };
      }
    | undefined,
): ConfirmSummary => ({
  created: {
    transactions: data?.createdCount?.transactions ?? 0,
    incomeItems: data?.createdCount?.incomeItems ?? 0,
    expenseItems: data?.createdCount?.expenseItems ?? 0,
  },
  skippedTransactions: data?.skippedCount?.transactions ?? 0,
});

/**
 * The reviewed batch → confirm body. Trims text, sends dates as ISO instants,
 * and omits empty optional fields. Call only when `validateXlsx` passed and a
 * budget + default account are chosen.
 */
export const toConfirmPayload = (
  state: XlsxImportState & { budgetId: string; defaultAccountId: string },
): ConfirmXlsxDto => ({
  budgetId: state.budgetId,
  defaultAccountId: state.defaultAccountId,
  accountMapping: state.accountMapping,
  transactions: state.transactions.map((r) => ({
    date: new Date(r.date).toISOString(),
    amount: r.amount,
    vendor: r.vendor.trim(),
    type: r.type,
    ...(r.description?.trim() ? { description: r.description.trim() } : {}),
    ...(r.paymentSource ? { paymentSource: r.paymentSource } : {}),
    ...(r.category ? { category: r.category } : {}),
  })),
  incomeItems: state.incomeItems.map((i) => ({
    description: i.description.trim(),
    amount: i.amount,
    type: i.type,
    accountId: i.accountId,
  })),
  expenseItems: state.expenseItems.map((e) => ({
    description: e.description.trim(),
    amount: e.amount,
    type: e.type,
  })),
});
