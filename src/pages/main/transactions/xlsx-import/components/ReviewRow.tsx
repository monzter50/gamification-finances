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
  TableCell,
  TableRow,
} from "@/components/ui";

import type { ParsedTransaction, ReviewTransaction, TransactionType, TxRowErrors } from "../types";

interface ReviewRowProps {
  row: ReviewTransaction;
  currency: string;
  errors?: TxRowErrors;
  // eslint-disable-next-line no-unused-vars
  onEdit: (id: string, patch: Partial<ParsedTransaction>) => void;
  // eslint-disable-next-line no-unused-vars
  onDelete: (id: string) => void;
}

export const ReviewRow = ({ row, currency, errors, onEdit, onDelete }: ReviewRowProps) => (
  <TableRow>
    <TableCell className="align-top">
      <Input
        type="date"
        value={row.date ? row.date.slice(0, 10) : ""}
        aria-invalid={errors?.date ? "true" : "false"}
        onChange={(e) => onEdit(row._id, { date: e.target.value })}
      />
      {errors?.date ? <p className="mt-1 text-xs text-danger">{errors.date}</p> : null}
    </TableCell>

    <TableCell className="align-top">
      <Input
        value={row.vendor}
        placeholder="Vendor"
        aria-invalid={errors?.vendor ? "true" : "false"}
        onChange={(e) => onEdit(row._id, { vendor: e.target.value })}
      />
      {errors?.vendor ? <p className="mt-1 text-xs text-danger">{errors.vendor}</p> : null}
    </TableCell>

    <TableCell className="align-top">
      <MoneyInput
        value={row.amount ?? null}
        currency={currency}
        aria-invalid={errors?.amount ? "true" : "false"}
        onChange={(v) => onEdit(row._id, { amount: v ?? 0 })}
      />
      {errors?.amount ? <p className="mt-1 text-xs text-danger">{errors.amount}</p> : null}
    </TableCell>

    <TableCell className="align-top">
      <Select value={row.type} onValueChange={(v) => onEdit(row._id, { type: v as TransactionType })}>
        <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
        </SelectContent>
      </Select>
    </TableCell>

    <TableCell className="align-top">
      <Input
        value={row.description ?? ""}
        placeholder="—"
        onChange={(e) => onEdit(row._id, { description: e.target.value })}
      />
    </TableCell>

    <TableCell className="align-top">
      <span className="text-xs text-muted-foreground">{row.paymentSource ?? "— (default)"}</span>
    </TableCell>

    <TableCell className="align-top">
      <Button variant="ghost" size="icon" aria-label={`Remove ${row.vendor || "row"}`} onClick={() => onDelete(row._id)}>
        <Trash2 className="text-danger" />
      </Button>
    </TableCell>
  </TableRow>
);
