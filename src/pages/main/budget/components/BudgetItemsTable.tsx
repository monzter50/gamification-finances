import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";

import {
  Badge,
  Button,
  EmptyState,
  Money,
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

/** Options for the "rows per page" selector. */
export const ROWS_PER_PAGE_OPTIONS = [ 5, 10, 25, 50 ] as const;

/** Row shape shared by IncomeItem and ExpenseItem. */
export interface BudgetItemRow {
  id?: string;
  description: string;
  amount: number;
  type: string;
}

interface BudgetItemsTableProps {
  items: BudgetItemRow[];
  tone: "income" | "expense";
  currency: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasActiveFilters: boolean;
  emptyLabel: string;
  // eslint-disable-next-line no-unused-vars
  onEdit: (item: BudgetItemRow) => void;
  // eslint-disable-next-line no-unused-vars
  onRemove: (id: string) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  // eslint-disable-next-line no-unused-vars
  onItemsPerPageChange: (n: number) => void;
  onClearFilters: () => void;
}

export const BudgetItemsTable = ({
  items,
  tone,
  currency,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  hasActiveFilters,
  emptyLabel,
  onEdit,
  onRemove,
  onNextPage,
  onPreviousPage,
  onItemsPerPageChange,
  onClearFilters,
}: BudgetItemsTableProps) => {
  if (items.length === 0) {
    return hasActiveFilters ? (
      <EmptyState
        title="No matches"
        description="No items match your filters."
        action={<Button variant="outline" onClick={onClearFilters}>Clear filters</Button>}
      />
    ) : (
      <EmptyState title={emptyLabel} description="Add your first item above to get started." />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.description}</TableCell>
              <TableCell>
                <Badge variant="secondary">{item.type}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Money value={item.amount} currency={currency} tone={tone} />
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" aria-label="Edit" onClick={() => onEdit(item)}>
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button size="sm" variant="ghost" aria-label="Remove" onClick={() => item.id && onRemove(item.id)}>
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select value={String(itemsPerPage)} onValueChange={(v) => onItemsPerPageChange(Number(v))}>
              <SelectTrigger className="h-8 w-[72px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROWS_PER_PAGE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({totalItems} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onPreviousPage} disabled={currentPage <= 1}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={onNextPage} disabled={currentPage >= totalPages}>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
};
