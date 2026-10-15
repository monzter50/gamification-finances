import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui";

interface TransactionsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

export const TransactionsPagination = ({
  currentPage,
  totalPages,
  totalItems,
  onNextPage,
  onPreviousPage,
}: TransactionsPaginationProps) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <p className="text-sm text-muted-foreground">
      Page {currentPage} of {totalPages} ({totalItems} total)
    </p>
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
