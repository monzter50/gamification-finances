import { useCallback, useState } from "react";

import { budgetService } from "@/services/budget.service";
import { incomeService } from "@/services/income.service";
import type { AddIncomeItemDTO, Budget } from "@/types/budget";

/**
 * Income-focused hook for the income management view.
 *
 * Owns its own `currentBudget` slice (budget state is not shared across views
 * in this app — each route fetches its own).
 *
 * IMPORTANT — mutation response shapes are NOT uniform (see the OpenAPI spec):
 *   - PATCH /income (updateIncomeItems) returns the full recalculated Budget.
 *   - POST /income (addIncomeItem) and DELETE /income/:id (deleteIncomeItem)
 *     return ONLY the touched item + totals, NOT the parent budget.
 * So we can't blindly `setCurrentBudget(mutationResponse)` for add/delete — that
 * would drop `incomeItems` and blank the table. Instead those paths refetch the
 * budget via `getBudgetById` (the single source of truth) to stay consistent.
 */
export const useIncome = () => {
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // POST returns only { item, totals } — refetch the full budget so the
      // table + totals reflect the new item.
      await incomeService.addIncomeItem(budgetId, data);
      const refreshed = await budgetService.getBudgetById(budgetId);
      setCurrentBudget(refreshed);
      return refreshed;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add income item";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateIncomeItems = useCallback(
    async (budgetId: string, incomeItems: AddIncomeItemDTO[]) => {
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
    },
    [],
  );

  const deleteIncomeItem = useCallback(async (budgetId: string, itemId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      // DELETE returns only a removal ack + totals — refetch the full budget so
      // the row disappears from the table and totals update.
      await incomeService.deleteIncomeItem(budgetId, itemId);
      const refreshed = await budgetService.getBudgetById(budgetId);
      setCurrentBudget(refreshed);
      return refreshed;
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
