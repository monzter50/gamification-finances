import { describe, expect, it } from "vitest";

import {
  toConfirmPayload,
  toConfirmSummary,
  toParseResult,
} from "@/features/transactions/xlsx-import/model/payloads";
import { initialXlsxState } from "@/features/transactions/xlsx-import/model/xlsx-reducer";

describe("xlsx import payloads", () => {
  it("fills missing parse lists with empty ones and derives counts", () => {
    const result = toParseResult({
      transactions: [{ date: "2026-05-02", amount: 1, vendor: "x", type: "expense" }],
    });
    expect(result.incomeItems).toEqual([]);
    expect(result.paymentSources).toEqual([]);
    expect(result.counts).toEqual({ transactions: 1, incomeItems: 0, expenseItems: 0 });
  });

  it("builds a trimmed confirm body without empty optional fields", () => {
    const payload = toConfirmPayload({
      ...initialXlsxState,
      budgetId: "b1",
      defaultAccountId: "a1",
      accountMapping: { BBVA: "a1" },
      transactions: [
        {
          _id: "1",
          date: "2026-05-02",
          amount: 80,
          vendor: " OXXO ",
          type: "expense",
          description: "  ",
          category: "Food",
        },
      ],
      incomeItems: [
        { _id: "2", description: " Salary ", amount: 30000, type: "Transfer", accountId: "a1" },
      ],
      expenseItems: [{ _id: "3", description: "Food ", amount: 3000, type: "Variable" }],
    });

    expect(payload.transactions[0]).toEqual({
      date: new Date("2026-05-02").toISOString(),
      amount: 80,
      vendor: "OXXO",
      type: "expense",
      category: "Food",
    });
    expect(payload.incomeItems[0].description).toBe("Salary");
    expect(payload.expenseItems[0]).toEqual({
      description: "Food",
      amount: 3000,
      type: "Variable",
    });
  });

  it("summarizes created and skipped counts, defaulting to 0", () => {
    expect(
      toConfirmSummary({ createdCount: { transactions: 3 }, skippedCount: { transactions: 2 } }),
    ).toEqual({
      created: { transactions: 3, incomeItems: 0, expenseItems: 0 },
      skippedTransactions: 2,
    });
  });
});
