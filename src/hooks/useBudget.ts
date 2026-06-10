import { useState, useCallback } from "react";

import { budgetService } from "@/services/budget.service";
import { expenseService } from "@/services/expense.service";
import { incomeService } from "@/services/income.service";
import type {
  Budget,
  CreateBudgetDTO,
  AddIncomeItemDTO,
  AddExpenseItemDTO,
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
      const updatedBudget = await incomeService.addIncomeItem(budgetId, data);
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
      const updatedBudget = await incomeService.updateIncomeItems(budgetId, incomeItems);
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
      const updatedBudget = await incomeService.deleteIncomeItem(budgetId, itemId);
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
      const updatedBudget = await expenseService.addExpenseItem(budgetId, data);
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
      const updatedBudget = await expenseService.updateExpenseItems(budgetId, expenseItems);
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
      const updatedBudget = await expenseService.deleteExpenseItem(budgetId, itemId);
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
    addExpenseItem,
    updateExpenseItems,
    deleteExpenseItem,
  };
};
