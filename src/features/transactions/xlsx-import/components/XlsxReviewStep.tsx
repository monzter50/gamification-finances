import type { Dispatch } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import {
  AccountMappingPanel,
  ExpenseItemsTable,
  IncomeItemsTable,
  ReviewTable,
} from "@/features/transactions/xlsx-import/components";
import type { XlsxValidation } from "@/features/transactions/xlsx-import/model/validate";
import type {
  XlsxAction,
  XlsxImportState,
} from "@/features/transactions/xlsx-import/model/xlsx-reducer";
import type { Account } from "@/types/api";
import type { Budget } from "@/types/budget";

export interface XlsxReviewStepProps {
  state: XlsxImportState;
  dispatch: Dispatch<XlsxAction>;
  validation: XlsxValidation;
  budgets: Budget[];
  accounts: Account[];
  currency: string;
}

// TODO(i18n)
/** Edit what the workbook produced before anything is written. */
export const XlsxReviewStep = ({
  state,
  dispatch,
  validation,
  budgets,
  accounts,
  currency,
}: XlsxReviewStepProps) => (
  <>
    <AccountMappingPanel
      budgets={budgets}
      accounts={accounts}
      paymentSources={state.paymentSources}
      budgetId={state.budgetId}
      defaultAccountId={state.defaultAccountId}
      accountMapping={state.accountMapping}
      batchError={validation.batchError}
      onBudgetChange={(budgetId) => dispatch({ type: "SET_BUDGET", budgetId })}
      onDefaultAccountChange={(accountId) => dispatch({ type: "SET_DEFAULT_ACCOUNT", accountId })}
      onSourceMap={(source, accountId) =>
        dispatch({ type: "SET_SOURCE_MAPPING", source, accountId })
      }
    />

    <Card>
      <CardHeader>
        <CardTitle>Income items ({state.incomeItems.length})</CardTitle>
        <CardDescription>
          From the &quot;Income&quot; sheet. Set a type and account for each.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <IncomeItemsTable
          rows={state.incomeItems}
          accounts={accounts}
          currency={currency}
          errors={validation.incomeErrors}
          onEdit={(id, patch) => dispatch({ type: "EDIT_INCOME", id, patch })}
          onDelete={(id) => dispatch({ type: "DELETE_INCOME", id })}
        />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Expense items ({state.expenseItems.length})</CardTitle>
        <CardDescription>
          From the &quot;Expenses&quot; sheet. Fixed/Variable is pre-filled from the sections.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ExpenseItemsTable
          rows={state.expenseItems}
          currency={currency}
          errors={validation.expenseErrors}
          onEdit={(id, patch) => dispatch({ type: "EDIT_EXPENSE", id, patch })}
          onDelete={(id) => dispatch({ type: "DELETE_EXPENSE", id })}
        />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Transactions ({state.transactions.length})</CardTitle>
        <CardDescription>
          From the &quot;Budget track&quot; sheet. Accounts come from the payment-source map above.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ReviewTable
          rows={state.transactions}
          currency={currency}
          rowErrors={validation.txErrors}
          onEditRow={(id, patch) => dispatch({ type: "EDIT_TX", id, patch })}
          onDeleteRow={(id) => dispatch({ type: "DELETE_TX", id })}
        />
      </CardContent>
    </Card>
  </>
);
