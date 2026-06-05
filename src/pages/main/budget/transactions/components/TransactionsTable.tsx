import { Trash2, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { memo } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Transaction, TransactionType } from "@/types/api";

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onEdit: (itemId: string, description: string, amount: number, type: TransactionType, category: string, date: string) => void;
  onRemove: (itemId: string) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

// Custom comparison function for memo
function arePropsEqual(prevProps: TransactionsTableProps, nextProps: TransactionsTableProps) {
  return (
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.currentPage === nextProps.currentPage &&
    prevProps.totalPages === nextProps.totalPages &&
    prevProps.totalItems === nextProps.totalItems &&
    prevProps.transactions === nextProps.transactions
  );
}

function TransactionsTableSkeleton() {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[ ...Array(5) ].map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-5 w-[100px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[200px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[120px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-[80px] rounded-full" />
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

const TransactionsTableComponent = ({
  transactions,
  isLoading = false,
  currentPage,
  totalPages,
  totalItems,
  onEdit,
  onRemove,
  onNextPage,
  onPreviousPage,
}: TransactionsTableProps) => {
  if (isLoading) {
    return <TransactionsTableSkeleton />;
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions yet. Add your first transaction above.
      </div>
    );
  }

  const getTypeColor = (type: TransactionType) => {
    switch (type) {
    case "income":
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    case "expense":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getAmountColor = (type: TransactionType) => {
    switch (type) {
    case "income":
      return "text-income";
    case "expense":
      return "text-expense";
    default:
      return "";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short",
      day: "numeric",
      year: "numeric" });
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">{formatDate(transaction.date)}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">{transaction.category}</span>
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </span>
              </TableCell>
              <TableCell className={`text-right font-semibold ${getAmountColor(transaction.type)}`}>
                ${transaction.amount.toLocaleString("es-MX")} MXN
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(transaction.id, transaction.description ?? "", transaction.amount, transaction.type, transaction.category, transaction.date)}
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemove(transaction.id)}
                  >
                    <Trash2 className="h-4 w-4 text-danger" />
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
          Page {currentPage} of {totalPages} ({totalItems} total transactions)
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
export const TransactionsTable = memo(TransactionsTableComponent, arePropsEqual);
