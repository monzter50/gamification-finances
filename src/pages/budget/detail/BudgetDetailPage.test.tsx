import { screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import BudgetDetailPage from "@/pages/budget/detail";
import { renderWithProviders } from "@/test/render";
import { api, server } from "@/test/server";
import type { Budget } from "@/types/budget";

const route = { path: "/budget/:id", url: "/budget/b1" };

const may2026: Budget = {
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
};

const serveBudget = () =>
  http.get(api("/budgets/b1"), () => HttpResponse.json({ success: true, data: may2026 }));

describe("Budget detail page", () => {
  it("shows planned totals and links to each section", async () => {
    server.use(serveBudget());

    renderWithProviders(<BudgetDetailPage />, { route });

    expect(await screen.findByText("May 2026")).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Budget sections" });
    expect(within(nav).getByRole("link", { name: /income management/i })).toHaveAttribute(
      "href",
      "/budget/b1/income",
    );
  });

  it("duplicates into the next month, and names the period when it's taken", async () => {
    let posted: unknown;
    server.use(
      serveBudget(),
      http.post(api("/budgets/b1/duplicate"), async ({ request }) => {
        posted = await request.json();
        return HttpResponse.json(
          {
            success: false,
            message: "Budget for 2026-6 already exists",
            errorCode: "BUDGET_ALREADY_EXISTS",
          },
          { status: 409 },
        );
      }),
    );
    const { user } = renderWithProviders(<BudgetDetailPage />, { route });

    await user.click(await screen.findByRole("button", { name: "Duplicate" }));
    const dialog = screen.getByRole("dialog", { name: "Duplicate budget" });
    await user.click(within(dialog).getByRole("button", { name: "Duplicate" }));

    // One toast with the modal's copy — `meta.silent` keeps the global one out.
    expect(await screen.findAllByText("June 2026 is already taken")).toHaveLength(1);
    expect(posted).toEqual({ year: 2026, month: 5 });
  });
});
