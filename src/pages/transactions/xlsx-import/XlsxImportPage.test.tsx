import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import XlsxImportPage from "@/pages/transactions/xlsx-import";
import { renderWithProviders } from "@/test/render";
import { api, server } from "@/test/server";

const workbook = () =>
  new File(["fake"], "budget.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

const emptyLists = () =>
  server.use(
    http.get(api("/accounts"), () => HttpResponse.json({ success: true, data: [] })),
    http.get(api("/budgets"), () => HttpResponse.json({ success: true, data: [] })),
  );

describe("Excel import page", () => {
  it("uploads the workbook through the generated client and shows the review", async () => {
    emptyLists();
    let parseCalls = 0;
    server.use(
      // jsdom's FormData isn't Node's, so the multipart body can't be decoded
      // here (it is in browsers) — assert the route instead.
      http.post(api("/transactions/import/xlsx/parse"), () => {
        parseCalls++;
        return HttpResponse.json({
          success: true,
          data: {
            transactions: [{ date: "2026-05-02", amount: 80, vendor: "OXXO", type: "expense" }],
            incomeItems: [],
            expenseItems: [{ description: "Food", amount: 3000, type: "Variable" }],
            paymentSources: ["BBVA"],
          },
        });
      }),
    );
    const { user } = renderWithProviders(<XlsxImportPage />);

    await user.upload(screen.getByLabelText("Excel workbook"), workbook());

    expect(await screen.findByText("Transactions (1)")).toBeInTheDocument();
    expect(screen.getByText("Expense items (1)")).toBeInTheDocument();
    // Missing lists in the response become empty, not a crash.
    expect(screen.getByText("Income items (0)")).toBeInTheDocument();
    expect(parseCalls).toBe(1);
  });

  it("shows the backend's reason when the workbook can't be read", async () => {
    emptyLists();
    server.use(
      http.post(api("/transactions/import/xlsx/parse"), () =>
        HttpResponse.json(
          {
            success: false,
            message: 'Sheet "Budget track" not found',
            errorCode: "VALIDATION_ERROR",
          },
          { status: 400 },
        ),
      ),
    );
    const { user } = renderWithProviders(<XlsxImportPage />);

    await user.upload(screen.getByLabelText("Excel workbook"), workbook());

    // Radix Toast also renders a copy for screen readers, hence findAll.
    expect((await screen.findAllByText("Could not read workbook"))[0]).toBeInTheDocument();
    expect(screen.getAllByText('Sheet "Budget track" not found')[0]).toBeInTheDocument();
    // Back on the upload step.
    expect(screen.getByRole("button", { name: "Choose .xlsx file" })).toBeInTheDocument();
  });
});
