import {
  EmptyState,
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";

import { ReviewRow } from "./ReviewRow";
import type { ParsedTransaction, ReviewTransaction, TxRowErrors } from "../types";

interface ReviewTableProps {
  rows: ReviewTransaction[];
  currency: string;
  rowErrors: Record<string, TxRowErrors>;
  // eslint-disable-next-line no-unused-vars
  onEditRow: (id: string, patch: Partial<ParsedTransaction>) => void;
  // eslint-disable-next-line no-unused-vars
  onDeleteRow: (id: string) => void;
}

export const ReviewTable = ({ rows, currency, rowErrors, onEditRow, onDeleteRow }: ReviewTableProps) => {
  if (rows.length === 0) {
    return <EmptyState title="No transactions" description="The 'Budget track' sheet produced no transactions." />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Vendor</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Source</TableHead>
          <TableHead className="sr-only">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <ReviewRow
            key={row._id}
            row={row}
            currency={currency}
            errors={rowErrors[row._id]}
            onEdit={onEditRow}
            onDelete={onDeleteRow}
          />
        ))}
      </TableBody>
    </Table>
  );
};
