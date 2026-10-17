import { screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import BudgetListPage from "@/pages/budget";
import { renderWithProviders } from "@/test/render";
import { api, server } from "@/test/server";
import type { Budget } from "@/types/budget";

const budget = (overrides: Partial<Budget> = {}): Budget => ({
  id: "b1",
  userId: "u1",
  year: 2026,
  month: 4,
  incomeItems: [
    { id: "i1", description: "Salary", amount: 30000, type: "Transfer", accountId: "a1" },
  ],
  expenseItems: [{ id: "e1", description: "Rent", amount: 9000, type: "Fixed" }],
  createdAt: "",
  updatedAt: "",
  ...overrides,
});

const listReturns = (budgets: Budget[]) =>
  http.get(api("/budgets"), () => HttpResponse.json({ success: true, data: budgets }));

describe("Budget list page", () => {
  it("lists budgets newest first with links to each one", async () => {
    server.use(listReturns([budget({ id: "old", month: 3 }), budget({ id: "new", month: 4 })]));

    renderWithProviders(<BudgetListPage />);

    const links = await screen.findAllByRole("link", { name: /^View / });
    expect(links.map((l) => l.getAttribute("href"))).toEqual(["/budget/new", "/budget/old"]);
    expect(screen.getByText("2026 Summary")).toBeInTheDocument();
  });

  it("shows the empty state when there are no budgets", async () => {
    server.use(listReturns([]));

    renderWithProviders(<BudgetListPage />);

    expect(await screen.findByText("No budgets yet")).toBeInTheDocument();
  });

  it("explains a taken period when creating a budget that already exists", async () => {
    server.use(
      listReturns([]),
      http.post(api("/budgets"), () =>
        HttpResponse.json(
          {
            success: false,
            message: "Budget for 2026-5 already exists",
            errorCode: "BUDGET_ALREADY_EXISTS",
          },
          { status: 409 },
        ),
      ),
    );
    const { user } = renderWithProviders(<BudgetListPage />);
    await screen.findByText("No budgets yet");

    await user.click(screen.getAllByRole("button", { name: "Create Budget" })[0]);
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Create Budget" }));

    expect(await screen.findByText("Couldn't create budget")).toBeInTheDocument();
    expect(screen.getByText("There's already a budget for that month.")).toBeInTheDocument();
    // The modal stays open so the user can pick another month.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
