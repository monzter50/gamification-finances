import { apiClient, getAuthToken } from "@/config/api-client";
import { budgetLogger } from "@/config/logger";
import type { ApiResponse } from "@/types/api";
import type { AddExpenseItemDTO, Budget } from "@/types/budget";

const BASE_URL = "/budgets";

/**
 * Expense item operations.
 *
 * Expense items are child entities of the Budget aggregate — every mutation
 * returns the full, recalculated Budget so the aggregate stays consistent.
 * These endpoints and payloads are intentionally identical to the previous
 * `budgetService` implementation; this module only separates the concern.
 */
class ExpenseService {
  /**
   * Add a single expense item to a budget
   */
  async addExpenseItem(budgetId: string, data: AddExpenseItemDTO): Promise<Budget> {
    budgetLogger.debug("Adding expense item", {
      budgetId,
      data
    });
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
      budgetLogger.error("Failed to add expense item", {
        status,
        statusCode,
        response
      });
      throw new Error(response?.message || "Failed to add expense item");
    }

    budgetLogger.info("Expense item added successfully", { budgetId });
    return response.data;
  }

  /**
   * Update all expense items
   */
  async updateExpenseItems(budgetId: string, expenseItems: AddExpenseItemDTO[]): Promise<Budget> {
    budgetLogger.debug("Updating expense items", {
      budgetId,
      count: expenseItems.length
    });
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
      budgetLogger.error("Failed to update expense items", {
        status,
        statusCode,
        response
      });
      throw new Error(response?.message || "Failed to update expense items");
    }

    budgetLogger.info("Expense items updated successfully", { budgetId });
    return response.data;
  }

  /**
   * Delete an expense item
   */
  async deleteExpenseItem(budgetId: string, itemId: string): Promise<Budget> {
    budgetLogger.debug("Deleting expense item", {
      budgetId,
      itemId
    });
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
      budgetLogger.error("Failed to delete expense item", {
        status,
        statusCode,
        response
      });
      throw new Error(response?.message || "Failed to delete expense item");
    }

    budgetLogger.info("Expense item deleted successfully", {
      budgetId,
      itemId
    });
    return response.data;
  }
}

export const expenseService = new ExpenseService();
