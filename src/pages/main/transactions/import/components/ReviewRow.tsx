import { Trash2 } from "lucide-react";

import {
  Badge,
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
import { cn } from "@/lib/utils";
import type { Account } from "@/types/api";

import type { ExtractedTransaction, ReviewRow as ReviewRowData, RowErrors, TransactionType } from "../types";

const BATCH_DEFAULT = "__default__";

interface ReviewRowProps {
  row: ReviewRowData;
  accounts: Account[];
  currency: string;
  errors?: RowErrors;
  // eslint-disable-next-line no-unused-vars
  onEdit: (id: string, patch: Partial<ExtractedTransaction>) => void;
  // eslint-disable-next-line no-unused-vars
  onDelete: (id: string) => void;
  // eslint-disable-next-line no-unused-vars
  onOverride: (id: string, accountId?: string) => void;
}

export const ReviewRow = ({ row, accounts, currency, errors, onEdit, onDelete, onOverride }: ReviewRowProps) => {
  const isLowConfidence = row.confidence === "low";

  return (
    <TableRow className={cn(isLowConfidence && "bg-warning-subtle")}>
      {/* Date */}
      <TableCell className="align-top">
        <Input
          type="date"
          value={row.date ? row.date.slice(0, 10) : ""}
          aria-invalid={errors?.date ? "true" : "false"}
          onChange={(e) => onEdit(row._id, { date: e.target.value })}
        />
        {errors?.date ? <p className="mt-1 text-xs text-danger">{errors.date}</p> : null}
      </TableCell>

      {/* Vendor (+ low-confidence flag + raw source text) */}
      <TableCell className="align-top">
        <div className="flex items-center gap-2">
          <Input
            value={row.vendor}
            placeholder="Vendor"
            aria-invalid={errors?.vendor ? "true" : "false"}
            onChange={(e) => onEdit(row._id, { vendor: e.target.value })}
          />
          {isLowConfidence ? (
            <Badge className="bg-warning-subtle text-warning shrink-0">Check</Badge>
          ) : null}
        </div>
        {errors?.vendor ? <p className="mt-1 text-xs text-danger">{errors.vendor}</p> : null}
        <p className="mt-1 text-xs text-muted-foreground" title={row.sourceText}>
          {row.sourceText}
        </p>
      </TableCell>

      {/* Amount */}
      <TableCell className="align-top">
        <MoneyInput
          value={row.amount ?? null}
          currency={currency}
          aria-invalid={errors?.amount ? "true" : "false"}
          onChange={(v) => onEdit(row._id, { amount: v ?? 0 })}
        />
        {errors?.amount ? <p className="mt-1 text-xs text-danger">{errors.amount}</p> : null}
      </TableCell>

      {/* Type */}
      <TableCell className="align-top">
        <Select value={row.type} onValueChange={(v) => onEdit(row._id, { type: v as TransactionType })}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>

      {/* Description */}
      <TableCell className="align-top">
        <Input
          value={row.description ?? ""}
          placeholder="—"
          onChange={(e) => onEdit(row._id, { description: e.target.value })}
        />
      </TableCell>

      {/* Per-row account override */}
      <TableCell className="align-top">
        <Select
          value={row.overrideAccountId ?? BATCH_DEFAULT}
          onValueChange={(v) => onOverride(row._id, v === BATCH_DEFAULT ? undefined : v)}
        >
          <SelectTrigger className="w-40"><SelectValue placeholder="Batch default" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={BATCH_DEFAULT}>Batch default</SelectItem>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* Delete */}
      <TableCell className="align-top">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Remove ${row.vendor || "row"}`}
          onClick={() => onDelete(row._id)}
        >
          <Trash2 className="text-danger" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
