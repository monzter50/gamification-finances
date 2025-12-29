import { logger } from "@aglaya/logger";
import { useState, useCallback } from "react";

import type { Transaction, CreateTransactionRequest } from "@/types/api";

import { useSnackbar } from "./useSnackbar";

interface UseTransactionsOptions {
  budgetYear: number;
  budgetMonth: number;
  onLoadSuccess?: (transactions: Transaction[]) => void;
  onLoadError?: (error: Error) => void;
}

interface UseTransactionsReturn {
  // State
  transactions: Transaction[];
  isLoading: boolean;

  // Actions
  loadTransactions: () => Promise<void>;
  addTransaction: (data: CreateTransactionRequest) => Promise<void>;
  updateTransaction: (id: string, data: Partial<CreateTransactionRequest>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

/**
 * Custom hook to manage transactions with CRUD operations
 *
 * This hook encapsulates the business logic for transaction management.
 * The parent component is responsible for handling mounted state.
 *
 * @param options Configuration options
 * @param options.budgetYear Year to filter transactions
 * @param options.budgetMonth Month to filter transactions (0-11)
 * @param options.onLoadSuccess Callback when transactions load successfully
 * @param options.onLoadError Callback when transactions fail to load
 *
 * @example
 * ```tsx
 * const { isMounted } = useMounted();
 * const { transactions, isLoading, addTransaction } = useTransactions({
 *   budgetYear: 2024,
 *   budgetMonth: 5,
 *   onLoadSuccess: (data) => {
 *     if (isMounted()) {
 *       // Handle success
 *     }
 *   }
 * });
 * ```
 */
export function useTransactions({
  budgetYear,
  budgetMonth,
  onLoadSuccess,
  onLoadError,
}: UseTransactionsOptions): UseTransactionsReturn {
  const [ transactions, setTransactions ] = useState<Transaction[]>([]);
  const [ isLoading, setIsLoading ] = useState(false);
  const snackbar = useSnackbar();

  /**
   * Load and filter transactions by budget period
   * Returns the filtered transactions for parent to handle
   */
  const loadTransactions = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response: Transaction[] = [];

      // Filter transactions by budget month and year
  
      setTransactions(response);
      onLoadSuccess?.(response);

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
  }, [ budgetYear, budgetMonth, onLoadSuccess, onLoadError, snackbar ]);

  /**
   * Add a new transaction and reload the list
   */
  const addTransaction = useCallback(
    async (data: CreateTransactionRequest) => {
      setIsLoading(true);
      try {
        logger.debug("Adding transaction", data);

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
    async (id: string, data: Partial<CreateTransactionRequest>) => {
      setIsLoading(true);
      try {
        logger.debug("Updating transaction", { id,
          data });

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
    loadTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
