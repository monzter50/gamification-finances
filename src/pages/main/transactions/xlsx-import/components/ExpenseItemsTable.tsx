import { Trash2 } from "lucide-react";

import {
  Button,
  Input,
  MoneyInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { EXPENSE_TYPES } from "@/types/budget";

import type { ExpenseItemType, ReviewExpenseItem } from "../types";
import type { ExpenseRowErrors } from "../validate";

interface ExpenseItemsTableProps {
  rows: ReviewExpenseItem[];
  currency: string;
  errors: Record<string, ExpenseRowErrors>;
  // eslint-disable-next-line no-unused-vars
  onEdit: (id: string, patch: Partial<ReviewExpenseItem>) => void;
  // eslint-disable-next-line no-unused-vars
  onDelete: (id: string) => void;
}

export const ExpenseItemsTable = ({ rows, currency, errors, onEdit, onDelete }: ExpenseItemsTableProps) => {
  if (rows.length === 0) { return null; }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="sr-only">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const e = errors[row._id];
          return (
            <TableRow key={row._id}>
              <TableCell className="align-top">
                <Input
                  value={row.description}
                  aria-invalid={e?.description ? "true" : "false"}
                  onChange={(ev) => onEdit(row._id, { description: ev.target.value })}
                />
                {e?.description ? <p className="mt-1 text-xs text-danger">{e.description}</p> : null}
              </TableCell>
              <TableCell className="align-top">
                <MoneyInput
                  value={row.amount ?? null}
                  currency={currency}
                  aria-invalid={e?.amount ? "true" : "false"}
                  onChange={(v) => onEdit(row._id, { amount: v ?? 0 })}
                />
                {e?.amount ? <p className="mt-1 text-xs text-danger">{e.amount}</p> : null}
              </TableCell>
              <TableCell className="align-top">
                <Select value={row.type} onValueChange={(v) => onEdit(row._id, { type: v as ExpenseItemType })}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXPENSE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="align-top">
                <Button variant="ghost" size="icon" aria-label={`Remove ${row.description || "expense item"}`} onClick={() => onDelete(row._id)}>
                  <Trash2 className="text-danger" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
