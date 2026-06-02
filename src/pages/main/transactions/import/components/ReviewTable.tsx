import {
  EmptyState,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import type { Account } from "@/types/api";
import { MONTHS, type Budget } from "@/types/budget";

import { ReviewRow } from "./ReviewRow";
import type { ExtractedTransaction, ReviewRow as ReviewRowData, RowErrors } from "../types";

interface ReviewTableProps {
  rows: ReviewRowData[];
  budgets: Budget[];
  accounts: Account[];
  budgetId: string | null;
  accountId: string | null;
  currency: string;
  rowErrors: Record<string, RowErrors>;
  batchError?: string;
  // eslint-disable-next-line no-unused-vars
  onEditRow: (id: string, patch: Partial<ExtractedTransaction>) => void;
  // eslint-disable-next-line no-unused-vars
  onDeleteRow: (id: string) => void;
  // eslint-disable-next-line no-unused-vars
  onOverrideRow: (id: string, accountId?: string) => void;
  // eslint-disable-next-line no-unused-vars
  onBudgetChange: (budgetId: string) => void;
  // eslint-disable-next-line no-unused-vars
  onAccountChange: (accountId: string) => void;
}

// `budget.month` is 0-based (0 = January) across this app — match how every
// other screen labels it (MONTHS[month]) so budgets read identically here.
const monthName = (year: number, month: number) => `${MONTHS[month]} ${year}`;

export const ReviewTable = ({
  rows,
  budgets,
  accounts,
  budgetId,
  accountId,
  currency,
  rowErrors,
  batchError,
  onEditRow,
  onDeleteRow,
  onOverrideRow,
  onBudgetChange,
  onAccountChange,
}: ReviewTableProps) => {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No rows to import"
        description="You removed every extracted transaction. Upload another statement to start over."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Batch-level budget + account */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="batch-budget">Budget</Label>
          <Select value={budgetId ?? ""} onValueChange={onBudgetChange}>
            <SelectTrigger id="batch-budget" className="w-56"><SelectValue placeholder="Select a budget" /></SelectTrigger>
            <SelectContent>
              {budgets.map((b) => (
                <SelectItem key={b.id} value={b.id}>{monthName(b.year, b.month)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="batch-account">Account</Label>
          <Select value={accountId ?? ""} onValueChange={onAccountChange}>
            <SelectTrigger id="batch-account" className="w-56"><SelectValue placeholder="Select an account" /></SelectTrigger>
            <SelectContent>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {batchError ? <p className="text-sm text-danger" role="alert">{batchError}</p> : null}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Account override</TableHead>
            <TableHead className="sr-only">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <ReviewRow
              key={row._id}
              row={row}
              accounts={accounts}
              currency={currency}
              errors={rowErrors[row._id]}
              onEdit={onEditRow}
              onDelete={onDeleteRow}
              onOverride={onOverrideRow}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
