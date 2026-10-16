import { describe, expect, it } from "vitest";

import {
  DEFAULT_FILTERS,
  hasActiveFilters,
  toTransactionFilters,
} from "@/features/transactions/model/list-filters";

describe("transaction list filters", () => {
  it("sends nothing for the defaults", () => {
    expect(toTransactionFilters(DEFAULT_FILTERS)).toEqual({});
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
  });

  it("sends only the filters that are set", () => {
    const values = { ...DEFAULT_FILTERS, type: "expense" as const, startDate: "2026-05-01" };
    expect(toTransactionFilters(values)).toEqual({ type: "expense", startDate: "2026-05-01" });
    expect(hasActiveFilters(values)).toBe(true);
  });
});
