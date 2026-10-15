import { screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import AccountsPage from "@/pages/main/accounts";
import { renderWithProviders } from "@/test/render";
import { api, server } from "@/test/server";
import type { Account } from "@/types/api";

const account = (overrides: Partial<Account> = {}): Account => ({
  id: "a1",
  userId: "u1",
  name: "BBVA Nómina",
  type: "checking",
  balance: 1500,
  currency: "MXN",
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...overrides,
});

const listReturns = (accounts: Account[]) =>
  http.get(api("/accounts"), () => HttpResponse.json({ success: true, data: accounts }));

describe("Accounts page", () => {
  it("lists the user's accounts", async () => {
    server.use(listReturns([account(), account({ id: "a2", name: "Ahorro", type: "savings" })]));

    renderWithProviders(<AccountsPage />);

    expect(await screen.findByText("BBVA Nómina")).toBeInTheDocument();
    expect(screen.getByText("Ahorro")).toBeInTheDocument();
  });

  it("shows the empty state when there are no accounts", async () => {
    server.use(listReturns([]));

    renderWithProviders(<AccountsPage />);

    expect(await screen.findByText("No accounts yet")).toBeInTheDocument();
  });

  it("shows a retryable error when the list fails, and recovers on retry", async () => {
    server.use(http.get(api("/accounts"), () => new HttpResponse(null, { status: 503 })));
    const { user } = renderWithProviders(<AccountsPage />);

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText("Couldn't load accounts")).toBeInTheDocument();

    server.use(listReturns([account()]));
    await user.click(within(alert).getByRole("button", { name: /try again/i }));

    expect(await screen.findByText("BBVA Nómina")).toBeInTheDocument();
  });

  it("creates an account and refreshes the list", async () => {
    let created: unknown;
    let accounts: Account[] = [];
    server.use(
      http.get(api("/accounts"), () => HttpResponse.json({ success: true, data: accounts })),
      http.post(api("/accounts"), async ({ request }) => {
        created = await request.json();
        accounts = [account({ id: "new", name: "Vales Despensa", type: "checking" })];
        return HttpResponse.json({ success: true, data: accounts[0] }, { status: 201 });
      }),
    );
    const { user } = renderWithProviders(<AccountsPage />);
    await screen.findByText("No accounts yet");

    await user.click(screen.getAllByRole("button", { name: /new account/i })[0]);
    await user.type(screen.getByLabelText("Account Name"), "  Vales Despensa ");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(await screen.findByText("Vales Despensa", { selector: "p" })).toBeInTheDocument();
    expect(created).toEqual({
      name: "Vales Despensa",
      type: "checking",
      balance: 0,
      currency: "MXN",
    });
    expect(screen.getByText("Account created")).toBeInTheDocument();
  });

  it("explains why an account with transactions can't be deleted", async () => {
    server.use(
      listReturns([account()]),
      http.delete(api("/accounts/a1"), () =>
        HttpResponse.json(
          { success: false, errorCode: "ACCOUNT_HAS_TRANSACTIONS" },
          { status: 409 },
        ),
      ),
    );
    const { user } = renderWithProviders(<AccountsPage />);

    await user.click(await screen.findByRole("button", { name: "Delete BBVA Nómina" }));
    await user.click(screen.getByRole("button", { name: "Delete Account" }));

    expect(await screen.findByText("Couldn't delete account")).toBeInTheDocument();
    expect(
      screen.getByText("This account has transactions. Move or delete them first."),
    ).toBeInTheDocument();
    // Modal stays open so the user isn't left guessing.
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
  });
});
