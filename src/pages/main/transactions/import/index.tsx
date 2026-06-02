import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";

import { Button, PageHeader } from "@/components/ui";
import { authLogger } from "@/config/logger";
import { useAuth } from "@/context/AuthContext";
import { useBudget } from "@/hooks";
import { useSnackbar } from "@/hooks";
import { importStatementService } from "@/services/import.service";
import { getErrorMessage } from "@/utils/errors";

import { ReviewTable, StatementUpload } from "./components";
import type { ConfirmImportDto } from "./types";
import { useImportReducer } from "./useImportReducer";
import { validateBatch } from "./validate";

const DEFAULT_CURRENCY = "MXN";

export default function ImportStatement() {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { accounts, refreshAccounts } = useAuth();
  const { budgets, fetchBudgets } = useBudget();
  const [ state, dispatch ] = useImportReducer();

  useEffect(() => {
    fetchBudgets().catch((err) => { authLogger.error("Failed to load budgets", err); });
  }, [ fetchBudgets ]);

  const validation = useMemo(() => validateBatch(state), [ state ]);
  const isReviewing = state.status === "reviewing" || state.status === "submitting";

  // Currency for the amount inputs: chosen account → extractor hint → default.
  const currency = useMemo(() => {
    const acct = accounts.find((a) => a.id === state.accountId);
    return acct?.currency ?? state.currencyHint ?? DEFAULT_CURRENCY;
  }, [ accounts, state.accountId, state.currencyHint ]);

  const handleFile = async (file: File) => {
    dispatch({ type: "UPLOAD_START",
      fileName: file.name });
    try {
      const data = await importStatementService.extract(file);
      dispatch({ type: "EXTRACT_SUCCESS",
        data });
    } catch (err) {
      const message = getErrorMessage(err);
      authLogger.error("Extraction failed", err);
      dispatch({ type: "EXTRACT_ERROR",
        message });
      snackbar.error({ title: "Could not read statement",
        description: message });
    }
  };

  const handleConfirm = async () => {
    if (!validation.valid || !state.budgetId || !state.accountId) { return; }

    dispatch({ type: "SUBMIT_START" });

    const payload: ConfirmImportDto = {
      budgetId:     state.budgetId,
      accountId:    state.accountId,
      transactions: state.rows.map((r) => ({
        date:   new Date(r.date).toISOString(),
        amount: r.amount,
        vendor: r.vendor.trim(),
        type:   r.type,
        ...(r.description?.trim() ? { description: r.description.trim() } : {}),
        ...(r.overrideAccountId ? { accountId: r.overrideAccountId } : {}),
      })),
    };

    try {
      const result = await importStatementService.confirm(payload);
      await refreshAccounts(); // balances changed
      snackbar.success({
        title:       "Transactions imported",
        description: `${result.createdCount} transaction(s) added.`,
      });
      navigate("/transactions");
    } catch (err) {
      const message = getErrorMessage(err);
      authLogger.error("Import confirm failed", err);
      dispatch({ type: "SUBMIT_ERROR",
        message });
      snackbar.error({ title: "Import failed",
        description: message });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import statement"
        description="Upload a statement image, review the extracted transactions, then save them to a budget."
        actions={
          <Button variant="outline" onClick={() => navigate("/transactions")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      {!isReviewing ? (
        <StatementUpload uploading={state.status === "uploading"} onFile={handleFile} />
      ) : (
        <>
          <ReviewTable
            rows={state.rows}
            budgets={budgets}
            accounts={accounts}
            budgetId={state.budgetId}
            accountId={state.accountId}
            currency={currency}
            rowErrors={validation.rowErrors}
            batchError={validation.batchError}
            onEditRow={(id, patch) => dispatch({ type: "EDIT_ROW",
              id,
              patch })}
            onDeleteRow={(id) => dispatch({ type: "DELETE_ROW",
              id })}
            onOverrideRow={(id, accountId) => dispatch({ type: "SET_ROW_OVERRIDE",
              id,
              overrideAccountId: accountId })}
            onBudgetChange={(budgetId) => dispatch({ type: "SET_BATCH_BUDGET",
              budgetId })}
            onAccountChange={(accountId) => dispatch({ type: "SET_BATCH_ACCOUNT",
              accountId })}
          />

          <div className="flex items-center gap-3">
            <Button onClick={handleConfirm} disabled={!validation.valid || state.status === "submitting"}>
              {state.status === "submitting" ? "Importing…" : `Import ${state.rows.length} transaction(s)`}
            </Button>
            <Button variant="ghost" onClick={() => dispatch({ type: "RESET" })} disabled={state.status === "submitting"}>
              Start over
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
