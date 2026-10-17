import { screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import TransactionsPage from "@/pages/transactions";
import { renderWithProviders } from "@/test/render";
import { api, server } from "@/test/server";
import type { Account, Transaction } from "@/types/api";

const account: Account = {
  id: "a1",
  userId: "u1",
  name: "BBVA",
  type: "checking",
  balance: 1000,
  currency: "MXN",
  isActive: true,
  createdAt: "",
  updatedAt: "",
};

const tx = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: "t1",
  userId: "u1",
  budgetId: null,
  date: "2026-05-10T00:00:00.000Z",
  amount: 120,
  vendor: "Spotify",
  category: "",
  type: "expense",
  owner: "",
  accountId: "a1",
  description: null,
  incomeItemId: null,
  expenseItemId: null,
  isInstallment: false,
  installmentCurrent: null,
  installmentTotal: null,
  installmentOriginal: null,
  createdAt: "",
  updatedAt: "",
  ...overrides,
});

const summary = {
  totalIncome: 0,
  totalExpense: 120,
  incomeCount: 0,
  expenseCount: 1,
  netBalance: -120,
};

/**
 * A tiny in-memory backend. Counts GETs per resource so tests can assert
 * what a mutation refreshed.
 */
const fakeBackend = (initial: Transaction[]) => {
  const state = { transactions: initial, gets: { accounts: 0, summary: 0, list: 0 } };
  server.use(
    http.get(api("/accounts"), () => {
      state.gets.accounts++;
      return HttpResponse.json({ success: true, data: [account] });
    }),
    http.get(api("/budgets"), () => HttpResponse.json({ success: true, data: [] })),
    http.get(api("/transactions/summary"), () => {
      state.gets.summary++;
      return HttpResponse.json({ success: true, data: summary });
    }),
    http.get(api("/transactions"), () => {
      state.gets.list++;
      const total = state.transactions.length;
      return HttpResponse.json({
        success: true,
        data: state.transactions,
        pagination: { page: 1, pages: 1, total, limit: 10 },
      });
    }),
  );
  return state;
};

describe("Transactions page", () => {
  it("lists transactions and the all-time totals", async () => {
    fakeBackend([tx()]);

    renderWithProviders(<TransactionsPage />);

    expect(await screen.findByRole("button", { name: "Vendor: Spotify" })).toBeInTheDocument();
    expect(screen.getByText("Net Balance")).toBeInTheDocument();
  });

  it("renames a vendor inline and refreshes balances and totals", async () => {
    const state = fakeBackend([tx()]);
    let sent: unknown;
    server.use(
      http.put(api("/transactions/t1"), async ({ request }) => {
        sent = await request.json();
        state.transactions = [tx({ vendor: "Spotify Family" })];
        return HttpResponse.json({ success: true, data: state.transactions[0] });
      }),
    );
    const { user } = renderWithProviders(<TransactionsPage />);
    await user.click(await screen.findByRole("button", { name: "Vendor: Spotify" }));
    await waitFor(() => expect(state.gets.accounts).toBeGreaterThan(0));
    const before = { ...state.gets };

    const input = screen.getByRole("textbox", { name: "Vendor" });
    await user.clear(input);
    await user.type(input, "Spotify Family{Enter}");

    expect(
      await screen.findByRole("button", { name: "Vendor: Spotify Family" }),
    ).toBeInTheDocument();
    expect(sent).toEqual({ vendor: "Spotify Family" });
    // invalidateFor("transaction"): balances and summaries refetch — no manual refresh.
    await waitFor(() => {
      expect(state.gets.accounts).toBeGreaterThan(before.accounts);
      expect(state.gets.summary).toBeGreaterThan(before.summary);
    });
  });

  it("rolls the cell back and toasts when the update fails", async () => {
    fakeBackend([tx()]);
    server.use(http.put(api("/transactions/t1"), () => new HttpResponse(null, { status: 500 })));
    const { user } = renderWithProviders(<TransactionsPage />);

    await user.click(await screen.findByRole("button", { name: "Vendor: Spotify" }));
    const input = screen.getByRole("textbox", { name: "Vendor" });
    await user.clear(input);
    await user.type(input, "Oops{Enter}");

    expect(await screen.findByText("Couldn't update transaction")).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Vendor: Spotify" })).toBeInTheDocument();
  });

  it("removes a transaction", async () => {
    const state = fakeBackend([tx()]);
    server.use(
      http.delete(api("/transactions/t1"), () => {
        state.transactions = [];
        return HttpResponse.json({ success: true, data: null });
      }),
    );
    const { user } = renderWithProviders(<TransactionsPage />);

    await user.click(await screen.findByRole("button", { name: "Remove Spotify" }));

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Vendor: Spotify" })).not.toBeInTheDocument(),
    );
  });

  it("shows an in-place error with retry when the list fails", async () => {
    fakeBackend([]);
    server.use(http.get(api("/transactions"), () => new HttpResponse(null, { status: 503 })));

    renderWithProviders(<TransactionsPage />);

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText("Couldn't load transactions")).toBeInTheDocument();
    expect(within(alert).getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });
});
