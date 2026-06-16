import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, PageHeader } from "@/components/ui";
import { authLogger } from "@/config/logger";
import { useAuth } from "@/context/AuthContext";
import { useBudget, useSnackbar } from "@/hooks";
import { xlsxImportService } from "@/services/xlsxImport.service";
import { getErrorMessage } from "@/utils/errors";

import { AccountMappingPanel, ExpenseItemsTable, IncomeItemsTable, ReviewTable, XlsxUpload } from "./components";
import type { ConfirmXlsxDto } from "./types";
import { useXlsxReducer } from "./useXlsxReducer";
import { validateXlsx } from "./validate";

const DEFAULT_CURRENCY = "MXN";

export default function XlsxImport() {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { accounts, refreshAccounts } = useAuth();
  const { budgets, fetchBudgets } = useBudget();
  const [ state, dispatch ] = useXlsxReducer();

  useEffect(() => {
    fetchBudgets().catch((err) => { authLogger.error("Failed to load budgets", err); });
  }, [ fetchBudgets ]);

  const validation = useMemo(() => validateXlsx(state), [ state ]);
  const isReviewing = state.status === "reviewing" || state.status === "submitting";

  const currency = useMemo(() => {
    const acct = accounts.find((a) => a.id === state.defaultAccountId);
    return acct?.currency ?? DEFAULT_CURRENCY;
  }, [ accounts, state.defaultAccountId ]);

  const handleFile = async (file: File) => {
    dispatch({ type: "UPLOAD_START",
      fileName: file.name });
    try {
      const data = await xlsxImportService.parse(file);
      dispatch({ type: "PARSE_SUCCESS",
        data });
    } catch (err) {
      const message = getErrorMessage(err);
      authLogger.error("Workbook parse failed", err);
      dispatch({ type: "PARSE_ERROR",
        message });
      snackbar.error({ title: "Could not read workbook",
        description: message });
    }
  };

  const handleConfirm = async () => {
    if (!validation.valid || !state.budgetId || !state.defaultAccountId) { return; }

    dispatch({ type: "SUBMIT_START" });

    const payload: ConfirmXlsxDto = {
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
    };

    try {
      const { createdCount } = await xlsxImportService.confirm(payload);
      await refreshAccounts();
      snackbar.success({
        title: "Imported",
        description:
          `${createdCount.transactions} transactions, ${createdCount.incomeItems} income items, ` +
          `${createdCount.expenseItems} expense items.`,
      });
      navigate("/transactions");
    } catch (err) {
      const message = getErrorMessage(err);
      authLogger.error("Xlsx import confirm failed", err);
      dispatch({ type: "SUBMIT_ERROR",
        message });
      snackbar.error({ title: "Import failed",
        description: message });
    }
  };

  const submitting = state.status === "submitting";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import from Excel"
        description="Upload your .xlsx budget workbook. Income and Expenses sheets become budget items; Budget track becomes transactions."
        actions={
          <Button variant="outline" onClick={() => navigate("/transactions")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      {!isReviewing ? (
        <XlsxUpload uploading={state.status === "uploading"} onFile={handleFile} />
      ) : (
        <>
          <AccountMappingPanel
            budgets={budgets}
            accounts={accounts}
            paymentSources={state.paymentSources}
            budgetId={state.budgetId}
            defaultAccountId={state.defaultAccountId}
            accountMapping={state.accountMapping}
            batchError={validation.batchError}
            onBudgetChange={(budgetId) => dispatch({ type: "SET_BUDGET",
              budgetId })}
            onDefaultAccountChange={(accountId) => dispatch({ type: "SET_DEFAULT_ACCOUNT",
              accountId })}
            onSourceMap={(source, accountId) => dispatch({ type: "SET_SOURCE_MAPPING",
              source,
              accountId })}
          />

          <Card>
            <CardHeader>
              <CardTitle>Income items ({state.incomeItems.length})</CardTitle>
              <CardDescription>From the &quot;Income&quot; sheet. Set a type and account for each.</CardDescription>
            </CardHeader>
            <CardContent>
              <IncomeItemsTable
                rows={state.incomeItems}
                accounts={accounts}
                currency={currency}
                errors={validation.incomeErrors}
                onEdit={(id, patch) => dispatch({ type: "EDIT_INCOME",
                  id,
                  patch })}
                onDelete={(id) => dispatch({ type: "DELETE_INCOME",
                  id })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense items ({state.expenseItems.length})</CardTitle>
              <CardDescription>From the &quot;Expenses&quot; sheet. Fixed/Variable is pre-filled from the sections.</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseItemsTable
                rows={state.expenseItems}
                currency={currency}
                errors={validation.expenseErrors}
                onEdit={(id, patch) => dispatch({ type: "EDIT_EXPENSE",
                  id,
                  patch })}
                onDelete={(id) => dispatch({ type: "DELETE_EXPENSE",
                  id })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transactions ({state.transactions.length})</CardTitle>
              <CardDescription>From the &quot;Budget track&quot; sheet. Accounts come from the payment-source map above.</CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewTable
                rows={state.transactions}
                currency={currency}
                rowErrors={validation.txErrors}
                onEditRow={(id, patch) => dispatch({ type: "EDIT_TX",
                  id,
                  patch })}
                onDeleteRow={(id) => dispatch({ type: "DELETE_TX",
                  id })}
              />
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button onClick={handleConfirm} disabled={!validation.valid || submitting}>
              {submitting ? "Importing…" : "Import everything"}
            </Button>
            <Button variant="ghost" onClick={() => dispatch({ type: "RESET" })} disabled={submitting}>
              Start over
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
