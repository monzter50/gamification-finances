import { Button } from "@/components/ui";
import { useAccountsList } from "@/features/accounts";
import { useBudgetsList } from "@/features/budget";
import {
  useConfirmImport,
  useParseWorkbook,
} from "@/features/transactions/xlsx-import/api/useXlsxImport";
import { XlsxUpload } from "@/features/transactions/xlsx-import/components";
import { XlsxReviewStep } from "@/features/transactions/xlsx-import/components/XlsxReviewStep";
import { useXlsxReducer } from "@/features/transactions/xlsx-import/hooks/useXlsxReducer";
import { toConfirmPayload } from "@/features/transactions/xlsx-import/model/payloads";
import { validateXlsx } from "@/features/transactions/xlsx-import/model/validate";
import { toUserMessage } from "@/shared/errors";
import { useSnackbar } from "@/shared/hooks";
import type { Account } from "@/types/api";
import type { Budget } from "@/types/budget";

const DEFAULT_CURRENCY = "MXN";
const NO_ACCOUNTS: Account[] = [];
const NO_BUDGETS: Budget[] = [];

export interface XlsxImportFlowProps {
  /** Called after a successful import (e.g. navigate to the list). */
  onImported: () => void;
}

// TODO(i18n)
/**
 * Upload → review → confirm. Nothing is written until "Import everything";
 * the confirm is atomic on the server. Failures toast via the MutationCache.
 */
export const XlsxImportFlow = ({ onImported }: XlsxImportFlowProps) => {
  const snackbar = useSnackbar();
  const { data: accounts = NO_ACCOUNTS } = useAccountsList();
  const { data: budgets = NO_BUDGETS } = useBudgetsList();
  const [state, dispatch] = useXlsxReducer();
  const parse = useParseWorkbook();
  const confirm = useConfirmImport();

  // Cheap pure derivations over the review state — computed inline.
  const validation = validateXlsx(state);
  const currency =
    accounts.find((a) => a.id === state.defaultAccountId)?.currency ?? DEFAULT_CURRENCY;
  const submitting = state.status === "submitting";

  const handleFile = (file: File) => {
    dispatch({ type: "UPLOAD_START", fileName: file.name });
    parse.mutate(file, {
      onSuccess: (data) => dispatch({ type: "PARSE_SUCCESS", data }),
      onError: (err) => dispatch({ type: "PARSE_ERROR", message: toUserMessage(err) }),
    });
  };

  const handleConfirm = () => {
    const { budgetId, defaultAccountId } = state;
    if (!validation.valid || !budgetId || !defaultAccountId) return;

    dispatch({ type: "SUBMIT_START" });
    confirm.mutate(toConfirmPayload({ ...state, budgetId, defaultAccountId }), {
      onSuccess: ({ created, skippedTransactions }) => {
        snackbar.success({
          title: "Imported",
          description:
            `${created.transactions} transactions, ${created.incomeItems} income items, ` +
            `${created.expenseItems} expense items.` +
            (skippedTransactions > 0 ? ` ${skippedTransactions} duplicates skipped.` : ""),
        });
        onImported();
      },
      onError: (err) => dispatch({ type: "SUBMIT_ERROR", message: toUserMessage(err) }),
    });
  };

  if (state.status === "idle" || state.status === "uploading") {
    return <XlsxUpload uploading={state.status === "uploading"} onFile={handleFile} />;
  }

  return (
    <>
      <XlsxReviewStep
        state={state}
        dispatch={dispatch}
        validation={validation}
        budgets={budgets}
        accounts={accounts}
        currency={currency}
      />
      <div className="flex items-center gap-3">
        <Button onClick={handleConfirm} disabled={!validation.valid || submitting}>
          {submitting ? "Importing…" : "Import everything"}
        </Button>
        <Button variant="ghost" onClick={() => dispatch({ type: "RESET" })} disabled={submitting}>
          Start over
        </Button>
      </div>
    </>
  );
};
