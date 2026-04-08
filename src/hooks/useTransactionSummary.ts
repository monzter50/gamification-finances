import { useState, useEffect } from "react";

import { transactionService } from "@/services/transaction.service";
import type { FinancialSummary, MonthlySummary } from "@/types/api";

interface UseTransactionSummaryOptions {
  autoFetch?: boolean;
}

interface UseTransactionSummaryReturn {
  summary: FinancialSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage transaction summary
 *
 * This hook provides overall financial summary including total income,
 * total expenses, and net balance across all transactions.
 *
 * @param options Configuration options
 * @param options.autoFetch Whether to automatically fetch on mount (default: true)
 *
 * @example
 * ```tsx
 * const { summary, loading, error, refetch } = useTransactionSummary();
 *
 * if (loading) return <Skeleton />;
 * if (error) return <Alert variant="error">{error}</Alert>;
 *
 * return (
 *   <div>
 *     <h3>Financial Summary</h3>
 *     <p>Total Income: ${summary?.totalIncome}</p>
 *     <p>Total Expenses: ${summary?.totalExpense}</p>
 *     <p>Net Balance: ${summary?.netBalance}</p>
 *   </div>
 * );
 * ```
 */
export function useTransactionSummary({
  autoFetch = true,
}: UseTransactionSummaryOptions = {}): UseTransactionSummaryReturn {
  const [ summary, setSummary ] = useState<FinancialSummary | null>(null);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await transactionService.getSummary();
      setSummary(response.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch summary";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchSummary();
    }
  }, [ autoFetch ]);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary,
  };
}

interface UseMonthlySummaryOptions {
  year: number;
  month: number;
  autoFetch?: boolean;
}

interface UseMonthlySummaryReturn {
  summary: MonthlySummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage monthly transaction summary
 *
 * This hook provides monthly financial summary with category breakdown,
 * showing totals and counts for each spending/income category.
 *
 * @param options Configuration options
 * @param options.year The year to fetch summary for
 * @param options.month The month to fetch summary for (1-12)
 * @param options.autoFetch Whether to automatically fetch on mount (default: true)
 *
 * @example
 * ```tsx
 * const { summary, loading, error, refetch } = useMonthlySummary({
 *   year: 2026,
 *   month: 2
 * });
 *
 * if (loading) return <Spinner />;
 * if (error) return <Alert variant="error">{error}</Alert>;
 *
 * return (
 *   <div>
 *     <h3>February 2026 Summary</h3>
 *     <p>Total Income: ${summary?.totalIncome}</p>
 *     <p>Total Expenses: ${summary?.totalExpense}</p>
 *     <h4>Category Breakdown</h4>
 *     {summary?.categoryBreakdown.map(cat => (
 *       <div key={cat.category}>
 *         {cat.category}: ${cat.total} ({cat.count} transactions)
 *       </div>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useMonthlySummary({
  year,
  month,
  autoFetch = true,
}: UseMonthlySummaryOptions): UseMonthlySummaryReturn {
  const [ summary, setSummary ] = useState<MonthlySummary | null>(null);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState<string | null>(null);

  const fetchSummary = async () => {
    if (!year || !month) {
      setError("Year and month are required");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await transactionService.getMonthlySummary(year, month);
      setSummary(response.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch monthly summary";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && year && month) {
      fetchSummary();
    }
  }, [ year, month, autoFetch ]);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary,
  };
}
