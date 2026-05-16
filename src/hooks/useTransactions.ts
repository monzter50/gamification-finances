import { logger } from "@aglaya/logger";
import { useState, useCallback, useEffect, useRef } from "react";

import { transactionService } from "@/services/transaction.service";
import type {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFilters
} from "@/types/api";

import { useSnackbar } from "./useSnackbar";

interface UseTransactionsOptions {
  budgetId?: string;
  filters?: TransactionFilters;
  autoLoad?: boolean;
  onLoadSuccess?: (transactions: Transaction[]) => void;
  onLoadError?: (error: Error) => void;
}

interface UseTransactionsReturn {
  // State
  transactions: Transaction[];
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;

  // Actions
  loadTransactions: () => Promise<void>;
  addTransaction: (data: CreateTransactionDto) => Promise<void>;
  updateTransaction: (id: string, data: UpdateTransactionDto) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

/**
 * Custom hook to manage transactions with CRUD operations
 *
 * This hook encapsulates the business logic for transaction management.
 *
 * @param options Configuration options
 * @param options.budgetId Optional budget ID to filter transactions
 * @param options.filters Optional filters for pagination and filtering
 * @param options.autoLoad Whether to automatically load transactions when budgetId or filters change (default: true)
 * @param options.onLoadSuccess Callback when transactions load successfully
 * @param options.onLoadError Callback when transactions fail to load
 *
 * @example
 * ```tsx
 * const { transactions, isLoading, addTransaction } = useTransactions({
 *   budgetId: 'budget-uuid',
 *   filters: { page: 1, limit: 20, type: 'expense' },
 *   autoLoad: true,
 *   onLoadSuccess: (data) => {
 *     console.log('Loaded transactions:', data);
 *   }
 * });
 * ```
 */
export function useTransactions({
  budgetId,
  filters,
  autoLoad = true,
  onLoadSuccess,
  onLoadError,
}: UseTransactionsOptions): UseTransactionsReturn {
  const [ transactions, setTransactions ] = useState<Transaction[]>([]);
  const [ pagination, setPagination ] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);
  const [ isLoading, setIsLoading ] = useState(false);
  const snackbar = useSnackbar();

  // Track if we need to load on mount
  const hasLoadedRef = useRef(false);
  const prevFiltersRef = useRef<string>("");

  /**
   * Load transactions with filters and pagination
   */
  const loadTransactions = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const combinedFilters: TransactionFilters = {
        ...filters,
        ...(budgetId && { budgetId }),
      };

      const response = await transactionService.getAll(combinedFilters);

      setTransactions(response.data);
      setPagination(response.pagination);
      onLoadSuccess?.(response.data);

    } catch (error) {
      const err = error instanceof Error ? error : new Error("An error occurred");

      snackbar.error({
        title: "Failed to load transactions",
        description: err.message,
      });

      onLoadError?.(err);

    } finally {
      setIsLoading(false);
    }
  }, [ budgetId, filters, onLoadSuccess, onLoadError, snackbar ]);

  // Auto-load transactions when budgetId or filters change.
  // NB: `budgetId` is optional now — the cross-budget list page relies on
  // loading the user's full transaction feed without a budget filter.
  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    const cacheKey = JSON.stringify({ budgetId,
      filters });
    const hasKeyChanged = prevFiltersRef.current !== cacheKey;

    // Load if:
    // 1. First mount and hasn't loaded yet
    // 2. Filters or budgetId have changed
    if (!hasLoadedRef.current || hasKeyChanged) {
      hasLoadedRef.current = true;
      prevFiltersRef.current = cacheKey;
      loadTransactions();
    }
  }, [ autoLoad, budgetId, filters, loadTransactions ]);

  /**
   * Add a new transaction and reload the list
   */
  const addTransaction = useCallback(
    async (data: CreateTransactionDto) => {
      setIsLoading(true);
      try {
        logger.debug("Adding transaction", data);

        await transactionService.create(data);

        snackbar.success({
          title: "Transaction added!",
          description: "Transaction has been added successfully.",
        });

        // Reload transactions to get the updated list
        await loadTransactions();
      } catch (error) {
        snackbar.error({
          title: "Failed to add transaction",
          description: error instanceof Error ? error.message : "An error occurred",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [ loadTransactions, snackbar ]
  );

  /**
   * Update an existing transaction and reload the list
   */
  const updateTransaction = useCallback(
    async (id: string, data: UpdateTransactionDto) => {
      setIsLoading(true);
      try {
        logger.debug("Updating transaction", { id,
          data });

        await transactionService.update(id, data);

        snackbar.success({
          title: "Transaction updated!",
          description: "Transaction has been updated successfully.",
        });

        // Reload transactions to get the updated list
        await loadTransactions();
      } catch (error) {
        snackbar.error({
          title: "Failed to update transaction",
          description: error instanceof Error ? error.message : "An error occurred",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [ loadTransactions, snackbar ]
  );

  /**
   * Delete a transaction and reload the list
   */
  const deleteTransaction = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        logger.debug("Deleting transaction", { id });

        await transactionService.delete(id);

        snackbar.success({
          title: "Transaction removed",
          description: "Transaction has been removed.",
        });

        // Reload transactions to get the updated list
        await loadTransactions();
      } catch (error) {
        snackbar.error({
          title: "Failed to remove transaction",
          description: error instanceof Error ? error.message : "An error occurred",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [ loadTransactions, snackbar ]
  );

  return {
    transactions,
    isLoading,
    pagination,
    loadTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
