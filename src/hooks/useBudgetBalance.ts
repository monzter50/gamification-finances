import { useState, useEffect } from "react";

import { transactionService } from "@/services/transaction.service";
import type { BudgetBalance } from "@/types/api";

interface UseBudgetBalanceOptions {
  budgetId: string;
  autoFetch?: boolean;
}

interface UseBudgetBalanceReturn {
  balance: BudgetBalance | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage budget balance
 *
 * This hook provides budget balance information including income and expense breakdowns,
 * showing how much of each budget item has been used vs. available.
 *
 * @param options Configuration options
 * @param options.budgetId The budget ID to fetch balance for
 * @param options.autoFetch Whether to automatically fetch on mount (default: true)
 *
 * @example
 * ```tsx
 * const { balance, loading, error, refetch } = useBudgetBalance({
 *   budgetId: 'budget-uuid-here'
 * });
 *
 * if (loading) return <Spinner />;
 * if (error) return <Alert variant="error">{error}</Alert>;
 *
 * return (
 *   <div>
 *     <h3>Income Breakdown</h3>
 *     {balance?.incomeBreakdown.map(item => (
 *       <div key={item.id}>
 *         {item.description}: ${item.remaining} remaining
 *       </div>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useBudgetBalance({
  budgetId,
  autoFetch = true,
}: UseBudgetBalanceOptions): UseBudgetBalanceReturn {
  const [ balance, setBalance ] = useState<BudgetBalance | null>(null);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!budgetId) {
      setError("Budget ID is required");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await transactionService.getBudgetBalance(budgetId);
      setBalance(response.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch budget balance";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && budgetId) {
      fetchBalance();
    }
  }, [ budgetId, autoFetch ]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  };
}
