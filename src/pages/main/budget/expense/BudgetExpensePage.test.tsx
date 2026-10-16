import { screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import BudgetExpensePage from "@/pages/main/budget/expense";
import { renderWithProviders } from "@/test/render";
import { api, server } from "@/test/server";
import type { Budget, ExpenseItem } from "@/types/budget";

const route = { path: "/budget/:id/expense", url: "/budget/b1/expense" };

const budget = (expenseItems: ExpenseItem[]): Budget => ({
  id: "b1",
  userId: "u1",
  year: 2026,
  month: 4,
  incomeItems: [],
  expenseItems,
  createdAt: "2026-05-01T00:00:00Z",
  updatedAt: "2026-05-01T00:00:00Z",
});

const rent: ExpenseItem = { id: "e1", description: "Rent", amount: 9000, type: "Fixed" };

/** GET /budgets/b1 serving whatever `items` holds at request time. */
const serveBudget = (items: { current: ExpenseItem[] }) =>
  http.get(api("/budgets/b1"), () =>
    HttpResponse.json({ success: true, data: budget(items.current) }),
  );

const totals = { totalIncome: 0, totalExpense: 0, netSavings: 0, savingsRate: 0 };

describe("Budget expense page", () => {
  it("shows the period and the budget's expense items", async () => {
    server.use(serveBudget({ current: [rent] }));

    renderWithProviders(<BudgetExpensePage />, { route });

    expect(await screen.findByText("May 2026")).toBeInTheDocument();
    const list = screen.getByRole("list", { name: "Expense items" });
    expect(within(list).getByText("Rent")).toBeInTheDocument();
  });

  it("shows a not-found error instead of a blank page for a missing budget", async () => {
    server.use(
      http.get(api("/budgets/b1"), () =>
        HttpResponse.json(
          { success: false, message: "Budget not found", errorCode: "BUDGET_NOT_FOUND" },
          { status: 404 },
        ),
      ),
    );

    renderWithProviders(<BudgetExpensePage />, { route });

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText("Couldn't load budget")).toBeInTheDocument();
  });

  it("adds an expense item through the generated client and refetches the budget", async () => {
    const items = { current: [rent] };
    let posted: unknown;
    server.use(
      serveBudget(items),
      http.post(api("/budgets/b1/expense"), async ({ request }) => {
        posted = await request.json();
        const item = {
          id: "e2",
          description: "Groceries",
          amount: 2500,
          type: "Variable" as const,
        };
        items.current = [...items.current, item];
        return HttpResponse.json({ success: true, data: { item, totals } }, { status: 201 });
      }),
    );
    const { user } = renderWithProviders(<BudgetExpensePage />, { route });
    await screen.findByText("Rent");

    await user.click(screen.getByRole("button", { name: "New" }));
    await user.type(screen.getByRole("textbox", { name: "Description" }), "Groceries");
    await user.type(screen.getByRole("textbox", { name: "Amount" }), "2500");
    await user.click(screen.getByRole("button", { name: "Save item" }));

    const list = screen.getByRole("list", { name: "Expense items" });
    expect(await within(list).findByText("Groceries")).toBeInTheDocument();
    expect(posted).toEqual({ description: "Groceries", amount: 2500, type: "Variable" });
  });

  it("toasts the backend's message when adding fails, and keeps what was typed", async () => {
    server.use(
      serveBudget({ current: [] }),
      http.post(api("/budgets/b1/expense"), () =>
        HttpResponse.json(
          {
            success: false,
            message: "Validation failed",
            errorCode: "VALIDATION_ERROR",
            errors: [{ field: "amount", message: "Amount must be at least 0.01" }],
          },
          { status: 400 },
        ),
      ),
    );
    const { user } = renderWithProviders(<BudgetExpensePage />, { route });

    await user.click(await screen.findByRole("button", { name: /new item/i }));
    await user.type(screen.getByRole("textbox", { name: "Description" }), "Gym");
    await user.type(screen.getByRole("textbox", { name: "Amount" }), "300");
    await user.click(screen.getByRole("button", { name: "Save item" }));

    expect(await screen.findByText("Couldn't add expense")).toBeInTheDocument();
    expect(screen.getByText("Amount must be at least 0.01")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Description" })).toHaveValue("Gym");
  });

  it("removes an expense item", async () => {
    const items = { current: [rent] };
    server.use(
      serveBudget(items),
      http.delete(api("/budgets/b1/expense/e1"), () => {
        items.current = [];
        return HttpResponse.json({ success: true, data: { totals } });
      }),
    );
    const { user } = renderWithProviders(<BudgetExpensePage />, { route });

    await user.click(await screen.findByRole("button", { name: "Remove Rent" }));

    expect(await screen.findByText("Expense removed")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Rent")).not.toBeInTheDocument());
    expect(screen.getByText("No expense items yet")).toBeInTheDocument();
  });
});
