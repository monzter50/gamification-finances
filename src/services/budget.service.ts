import { apiClient, getAuthToken } from "@/config/api-client";
import { budgetLogger } from "@/config/logger";
import type { ApiResponse } from "@/types/api";
import type {
  AddExpenseItemDTO,
  AddIncomeItemDTO,
  Budget,
  BudgetStats,
  CreateBudgetDTO,
} from "@/types/budget";

const BASE_URL = "/budgets";

class BudgetService {
  /**
   * Get all budgets for the authenticated user
   */
  async getBudgets(filters?: { year?: number; month?: number }): Promise<Budget[]> {
    budgetLogger.debug("Fetching budgets", filters);
    const token = getAuthToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }
    const queryParams = new URLSearchParams();
    if (filters?.year) { queryParams.append("year", filters.year.toString()); }
    if (filters?.month) { queryParams.append("month", filters.month.toString()); }

    const url = queryParams.toString() ? `${BASE_URL}?${queryParams}` : BASE_URL;
    const { response, status, statusCode } = await apiClient.get<ApiResponse<Budget[]>>(url,{
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });
    
    const budgets = response?.data || [];

    if (statusCode !== 200) {
      budgetLogger.error("Failed to fetch budgets", { status,
        statusCode,
        response });
      throw new Error("Failed to fetch budgets");
    }

    budgetLogger.info("Budgets fetched successfully", { count: response?.data?.length });
    return  budgets;
  }

  /**
   * Get budget by ID
   */
  async getBudgetById(id: string): Promise<Budget> {
    budgetLogger.debug("Fetching budget by ID", { id });
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { response, status, statusCode } = await apiClient.get<ApiResponse<Budget>>(`${BASE_URL}/${id}`, {
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    if (status === "error" || statusCode !== 200) {
      budgetLogger.error("Failed to fetch budget", { status,
        statusCode,
        response });
      throw new Error(response?.message || "Failed to fetch budget");
    }

    budgetLogger.info("Budget fetched successfully", { id });
    return response.data;
  }

  /**
   * Get budget statistics
   */
  async getBudgetStats(): Promise<BudgetStats> {
    budgetLogger.debug("Fetching budget stats");
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { response, status, statusCode } = await apiClient.get<ApiResponse<BudgetStats>>(`${BASE_URL}/stats`, {
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    if (status === "error" || statusCode !== 200) {
      budgetLogger.error("Failed to fetch budget stats", { status,
        statusCode,
        response });
      throw new Error(response?.message || "Failed to fetch stats");
    }

    budgetLogger.info("Budget stats fetched successfully");
    return response.data;
  }

  /**
   * Create a new budget
   */
  async createBudget(data: CreateBudgetDTO): Promise<Budget> {
    budgetLogger.debug("Creating budget", data);
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { response, status, statusCode } = await apiClient.post<ApiResponse<Budget>>(BASE_URL, {
      body: JSON.parse(JSON.stringify(data)),
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    if (status === "error" || statusCode !== 201) {
      budgetLogger.error("Failed to create budget", { status,
        statusCode,
        response });
      throw new Error(response?.message || "Failed to create budget");
    }

    budgetLogger.info("Budget created successfully", { id: response.data._id });
    return response.data;
  }

  /**
   * Update budget
   */
  async updateBudget(id: string, data: Partial<CreateBudgetDTO>): Promise<Budget> {
    budgetLogger.debug("Updating budget", { id,
      data });
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { response, status, statusCode } = await apiClient.put<ApiResponse<Budget>>(`${BASE_URL}/${id}`, {
      body: JSON.parse(JSON.stringify(data)),
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    if (status === "error" || statusCode !== 200) {
      budgetLogger.error("Failed to update budget", { status,
        statusCode,
        response });
      throw new Error(response?.message || "Failed to update budget");
    }

    budgetLogger.info("Budget updated successfully", { id });
    return response.data;
  }

  /**
   * Delete budget
   */
  async deleteBudget(id: string): Promise<void> {
    budgetLogger.debug("Deleting budget", { id });
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { response, status, statusCode } = await apiClient.delete<ApiResponse<void>>(`${BASE_URL}/${id}`, {
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    if (status === "error" || statusCode !== 200) {
      budgetLogger.error("Failed to delete budget", { status,
        statusCode,
        response });
      throw new Error(response?.message || "Failed to delete budget");
    }

    budgetLogger.info("Budget deleted successfully", { id });
  }

  /**
   * Add a single income item to a budget
   */
  async addIncomeItem(budgetId: string, data: AddIncomeItemDTO): Promise<Budget> {
    budgetLogger.debug("Adding income item", { budgetId,
      data });
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { response, status, statusCode } = await apiClient.post<ApiResponse<Budget>>(
      `${BASE_URL}/${budgetId}/income`,
      {
        body: JSON.parse(JSON.stringify(data)),
        authentication: {
          token,
        },
        options: {
          requiredAuth: true,
        },
      }
    );

    if (status === "error" || statusCode !== 201) {
      budgetLogger.error("Failed to add income item", { status,
        statusCode,
        response });
      throw new Error(response?.message || "Failed to add income item");
    }

    budgetLogger.info("Income item added successfully", { budgetId });
    return response.data;
  }

  /**
   * Update all income items
   */
  async updateIncomeItems(budgetId: string, incomeItems: AddIncomeItemDTO[]): Promise<Budget> {
    budgetLogger.debug("Updating income items", { budgetId,
      count: incomeItems.length });
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { response, status, statusCode } = await apiClient.patch<ApiResponse<Budget>>(
      `${BASE_URL}/${budgetId}/income`,
      {
        body: JSON.parse(JSON.stringify({ incomeItems })),
        authentication: {
          token,
        },
        options: {
          requiredAuth: true,
        },
      }
    );

    if (status === "error" || statusCode !== 200) {
      budgetLogger.error("Failed to update income items", { status,
        statusCode,
        response });
      throw new Error(response?.message || "Failed to update income items");
    }

    budgetLogger.info("Income items updated successfully", { budgetId });
    return response.data;
  }

  /**
   * Delete an income item
   */
  async deleteIncomeItem(budgetId: string, itemId: string): Promise<Budget> {
    budgetLogger.debug("Deleting income item", { budgetId,
      itemId });
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { response, status, statusCode } = await apiClient.delete<ApiResponse<Budget>>(
      `${BASE_URL}/${budgetId}/income/${itemId}`,
      {
        authentication: {
          token,
        },
        options: {
          requiredAuth: true,
        },
      }
    );

    if (status === "error" || statusCode !== 200) {
      budgetLogger.error("Failed to delete income item", { status,
        statusCode,
        response });
      throw new Error(response?.message || "Failed to delete income item");
    }

    budgetLogger.info("Income item deleted successfully", { budgetId,
      itemId });
    return response.data;
  }

  /**
   * Add a single expense item to a budget
   */
  async addExpenseItem(budgetId: string, data: AddExpenseItemDTO): Promise<Budget> {
    budgetLogger.debug("Adding expense item", { budgetId,
      data });
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { response, status, statusCode } = await apiClient.post<ApiResponse<Budget>>(
      `${BASE_URL}/${budgetId}/expense`,
      {
        body: JSON.parse(JSON.stringify(data)),
        authentication: {
          token,
        },
        options: {
          requiredAuth: true,
        },
      }
    );

    if (status === "error" || statusCode !== 201) {
      budgetLogger.error("Failed to add expense item", { status,
        statusCode,
        response });
      throw new Error(response?.message || "Failed to add expense item");
    }

    budgetLogger.info("Expense item added successfully", { budgetId });
    return response.data;
  }

  /**
   * Update all expense items
   */
  async updateExpenseItems(budgetId: string, expenseItems: AddExpenseItemDTO[]): Promise<Budget> {
    budgetLogger.debug("Updating expense items", { budgetId,
      count: expenseItems.length });
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { response, status, statusCode } = await apiClient.patch<ApiResponse<Budget>>(
      `${BASE_URL}/${budgetId}/expense`,
      {
        body: JSON.parse(JSON.stringify({ expenseItems })),
        authentication: {
          token,
        },
        options: {
          requiredAuth: true,
        },
      }
    );

    if (status === "error" || statusCode !== 200) {
      budgetLogger.error("Failed to update expense items", { status,
        statusCode,
        response });
      throw new Error(response?.message || "Failed to update expense items");
    }

    budgetLogger.info("Expense items updated successfully", { budgetId });
    return response.data;
  }

  /**
   * Delete an expense item
   */
  async deleteExpenseItem(budgetId: string, itemId: string): Promise<Budget> {
    budgetLogger.debug("Deleting expense item", { budgetId,
      itemId });
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { response, status, statusCode } = await apiClient.delete<ApiResponse<Budget>>(
      `${BASE_URL}/${budgetId}/expense/${itemId}`,
      {
        authentication: {
          token,
        },
        options: {
          requiredAuth: true,
        },
      }
    );

    if (status === "error" || statusCode !== 200) {
      budgetLogger.error("Failed to delete expense item", { status,
        statusCode,
        response });
      throw new Error(response?.message || "Failed to delete expense item");
    }

    budgetLogger.info("Expense item deleted successfully", { budgetId,
      itemId });
    return response.data;
  }

  /**
   * Calculate budget totals locally (for client-side calculations)
   */
  calculateTotals(budget: Budget) {
    const totalIncome = budget.incomeItems.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = budget.expenseItems.reduce((sum, item) => sum + item.amount, 0);
    const savings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpense,
      savings,
      savingsRate,
    };
  }
}

export const budgetService = new BudgetService();
