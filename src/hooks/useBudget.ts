import { useState, useCallback } from "react";

import { budgetService } from "@/services/budget.service";
import type {
  Budget,
  CreateBudgetDTO,
  AddIncomeItemDTO,
  AddExpenseItemDTO,
  PaginationParams,
  PaginatedResponse,
  IncomeItem,
  ExpenseItem,
} from "@/types/budget";

export const useBudget = () => {
  const [ budgets, setBudgets ] = useState<Budget[]>([]);
  const [ currentBudget, setCurrentBudget ] = useState<Budget | null>(null);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ error, setError ] = useState<string | null>(null);

  const fetchBudgets = useCallback(async (filters?: { year?: number; month?: number }) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await budgetService.getBudgets(filters);
      setBudgets(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch budgets";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const createBudget = useCallback(async (data: CreateBudgetDTO) => {
    try {
      setIsLoading(true);
      setError(null);
      const newBudget = await budgetService.createBudget(data);
      setBudgets((prev) => [ ...prev, newBudget ]);
      return newBudget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create budget";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBudget = useCallback(async (id: string, data: Partial<CreateBudgetDTO>) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedBudget = await budgetService.updateBudget(id, data);
      setBudgets((prev) => prev.map((b) => (b.id === id ? updatedBudget : b)));
      if (currentBudget?.id === id) {
        setCurrentBudget(updatedBudget);
      }
      return updatedBudget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update budget";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ currentBudget ]);

  const deleteBudget = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await budgetService.deleteBudget(id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      if (currentBudget?.id === id) {
        setCurrentBudget(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete budget";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ currentBudget ]);

  const addIncomeItem = useCallback(async (budgetId: string, data: AddIncomeItemDTO) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedBudget = await budgetService.addIncomeItem(budgetId, data);
      setBudgets((prev) => prev.map((b) => (b.id === budgetId ? updatedBudget : b)));
      if (currentBudget?.id === budgetId) {
        setCurrentBudget(updatedBudget);
      }
      return updatedBudget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add income item";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ currentBudget ]);

  const updateIncomeItems = useCallback(async (budgetId: string, incomeItems: AddIncomeItemDTO[]) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedBudget = await budgetService.updateIncomeItems(budgetId, incomeItems);
      setBudgets((prev) => prev.map((b) => (b.id === budgetId ? updatedBudget : b)));
      if (currentBudget?.id === budgetId) {
        setCurrentBudget(updatedBudget);
      }
      return updatedBudget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update income items";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ currentBudget ]);

  const deleteIncomeItem = useCallback(async (budgetId: string, itemId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedBudget = await budgetService.deleteIncomeItem(budgetId, itemId);
      setBudgets((prev) => prev.map((b) => (b.id === budgetId ? updatedBudget : b)));
      if (currentBudget?.id === budgetId) {
        setCurrentBudget(updatedBudget);
      }
      return updatedBudget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete income item";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ currentBudget ]);

  const addExpenseItem = useCallback(async (budgetId: string, data: AddExpenseItemDTO) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedBudget = await budgetService.addExpenseItem(budgetId, data);
      setBudgets((prev) => prev.map((b) => (b.id === budgetId ? updatedBudget : b)));
      if (currentBudget?.id === budgetId) {
        setCurrentBudget(updatedBudget);
      }
      return updatedBudget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add expense item";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ currentBudget ]);

  const updateExpenseItems = useCallback(async (budgetId: string, expenseItems: AddExpenseItemDTO[]) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedBudget = await budgetService.updateExpenseItems(budgetId, expenseItems);
      setBudgets((prev) => prev.map((b) => (b.id === budgetId ? updatedBudget : b)));
      if (currentBudget?.id === budgetId) {
        setCurrentBudget(updatedBudget);
      }
      return updatedBudget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update expense items";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ currentBudget ]);

  const deleteExpenseItem = useCallback(async (budgetId: string, itemId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedBudget = await budgetService.deleteExpenseItem(budgetId, itemId);
      setBudgets((prev) => prev.map((b) => (b.id === budgetId ? updatedBudget : b)));
      if (currentBudget?.id === budgetId) {
        setCurrentBudget(updatedBudget);
      }
      return updatedBudget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete expense item";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ currentBudget ]);

  const fetchIncomeItemsPaginated = useCallback(
    async (budgetId: string, params?: PaginationParams): Promise<PaginatedResponse<IncomeItem>> => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await budgetService.getIncomeItemsPaginated(budgetId, params);
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch income items";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchExpenseItemsPaginated = useCallback(
    async (budgetId: string, params?: PaginationParams): Promise<PaginatedResponse<ExpenseItem>> => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await budgetService.getExpenseItemsPaginated(budgetId, params);
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch expense items";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    budgets,
    currentBudget,
    isLoading,
    error,
    fetchBudgets,
    fetchBudgetById,
    createBudget,
    updateBudget,
    deleteBudget,
    addIncomeItem,
    updateIncomeItems,
    deleteIncomeItem,
    fetchIncomeItemsPaginated,
    addExpenseItem,
    updateExpenseItems,
    deleteExpenseItem,
    fetchExpenseItemsPaginated,
  };
};
