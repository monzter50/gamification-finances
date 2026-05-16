import { Trash2, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { memo } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { IncomeItem, IncomeType } from "@/types/budget";

interface IncomeTableProps {
  incomeItems: IncomeItem[];
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onEdit: (itemId: string, description: string, amount: number, type: IncomeType) => void;
  onRemove: (itemId: string) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

// Custom comparison function for memo
function arePropsEqual(prevProps: IncomeTableProps, nextProps: IncomeTableProps) {
  return (
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.currentPage === nextProps.currentPage &&
    prevProps.totalPages === nextProps.totalPages &&
    prevProps.totalItems === nextProps.totalItems &&
    prevProps.incomeItems === nextProps.incomeItems
  );
}

function IncomeTableSkeleton() {
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
          {[ ...Array(5) ].map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-5 w-[200px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-[100px] rounded-full" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-5 w-[120px] ml-auto" />
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <Skeleton className="h-5 w-[200px]" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-[100px]" />
          <Skeleton className="h-9 w-[80px]" />
        </div>
      </div>
    </>
  );
}

const IncomeTableComponent = ({
  incomeItems,
  isLoading = false,
  currentPage,
  totalPages,
  totalItems,
  onEdit,
  onRemove,
  onNextPage,
  onPreviousPage,
}: IncomeTableProps) => {
  if (isLoading) {
    return <IncomeTableSkeleton />;
  }

  if (!incomeItems || incomeItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No income items yet. Add your first income source above.
      </div>
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
          {incomeItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.description}</TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {item.type}
                </span>
              </TableCell>
              <TableCell className="text-right text-green-600 dark:text-green-400 font-semibold">
                ${item.amount.toLocaleString("es-MX")} MXN
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(item.id!, item.description, item.amount, item.type)}
                  >
                    <Pencil className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemove(item.id!)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages} ({totalItems} total items)
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </>
  );
};

// Export memoized version with custom comparison
export const IncomeTable = memo(IncomeTableComponent, arePropsEqual);
