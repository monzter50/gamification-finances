import { Trash2, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { memo } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ExpenseItem, ExpenseType } from "@/types/budget";

interface ExpenseTableProps {
  expenseItems: ExpenseItem[];
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onEdit: (itemId: string, description: string, amount: number, type: ExpenseType) => void;
  onRemove: (itemId: string) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

// Custom comparison function for memo
function arePropsEqual(prevProps: ExpenseTableProps, nextProps: ExpenseTableProps) {
  return (
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.currentPage === nextProps.currentPage &&
    prevProps.totalPages === nextProps.totalPages &&
    prevProps.totalItems === nextProps.totalItems &&
    prevProps.expenseItems === nextProps.expenseItems
  );
}

function ExpenseTableSkeleton() {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-24"></TableHead>
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

const ExpenseTableComponent = ({
  expenseItems,
  isLoading = false,
  currentPage,
  totalPages,
  totalItems,
  onEdit,
  onRemove,
  onNextPage,
  onPreviousPage,
}: ExpenseTableProps) => {
  if (isLoading) {
    return <ExpenseTableSkeleton />;
  }

  if (!expenseItems || expenseItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No expense items yet. Add your first expense above.
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
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenseItems.map((item) => (
            <TableRow key={item._id}>
              <TableCell className="font-medium">{item.description}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  item.type === "Fixed"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                }`}>
                  {item.type === "Fixed" ? "📌 Fixed" : "💸 Variable"}
                </span>
              </TableCell>
              <TableCell className="text-right text-red-600 dark:text-red-400 font-semibold">
                ${item.amount.toLocaleString("es-MX")} MXN
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(item._id!, item.description, item.amount, item.type)}
                  >
                    <Pencil className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemove(item._id!)}
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
export const ExpenseTable = memo(ExpenseTableComponent, arePropsEqual);
