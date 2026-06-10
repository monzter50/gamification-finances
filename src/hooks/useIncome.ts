import { useCallback, useState } from "react";

import { budgetService } from "@/services/budget.service";
import { incomeService } from "@/services/income.service";
import type { AddIncomeItemDTO, Budget } from "@/types/budget";

/**
 * Income-focused hook for the income management view.
 *
 * Owns its own `currentBudget` slice (budget state is not shared across views
 * in this app — each route fetches its own). Income mutations go through
 * `incomeService` and return the full, recalculated Budget, which we set as the
 * new `currentBudget` so totals and the items table stay consistent with the
 * Budget aggregate. The initial load reuses `budgetService.getBudgetById` —
 * the single source for fetching a budget.
 */
export const useIncome = () => {
  const [ currentBudget, setCurrentBudget ] = useState<Budget | null>(null);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ error, setError ] = useState<string | null>(null);

  const fetchBudgetById = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await budgetService.getBudgetById(id);
      setCurrentBudget(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch budget";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addIncomeItem = useCallback(async (budgetId: string, data: AddIncomeItemDTO) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedBudget = await incomeService.addIncomeItem(budgetId, data);
      setCurrentBudget(updatedBudget);
      return updatedBudget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add income item";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateIncomeItems = useCallback(async (budgetId: string, incomeItems: AddIncomeItemDTO[]) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedBudget = await incomeService.updateIncomeItems(budgetId, incomeItems);
      setCurrentBudget(updatedBudget);
      return updatedBudget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update income items";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteIncomeItem = useCallback(async (budgetId: string, itemId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedBudget = await incomeService.deleteIncomeItem(budgetId, itemId);
      setCurrentBudget(updatedBudget);
      return updatedBudget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete income item";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    currentBudget,
    isLoading,
    error,
    fetchBudgetById,
    addIncomeItem,
    updateIncomeItems,
    deleteIncomeItem,
  };
};
