import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

/** Options for the "rows per page" selector. */
export const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50] as const;

interface BudgetItemsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
  // eslint-disable-next-line no-unused-vars
  onItemsPerPageChange: (n: number) => void;
}

export const BudgetItemsPagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onNextPage,
  onPreviousPage,
  onItemsPerPageChange,
}: BudgetItemsPaginationProps) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Rows per page</span>
        <Select value={String(itemsPerPage)} onValueChange={(v) => onItemsPerPageChange(Number(v))}>
          <SelectTrigger className="h-8 w-[72px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROWS_PER_PAGE_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
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
);
