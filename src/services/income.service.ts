import { apiClient, getAuthToken } from "@/config/api-client";
import { budgetLogger } from "@/config/logger";
import type { ApiResponse } from "@/types/api";
import type { AddIncomeItemDTO, Budget } from "@/types/budget";
import { normalizeBudget } from "@/utils/budget-totals";
import { getApiErrorMessage } from "@/utils/errors";

const BASE_URL = "/budgets";

/**
 * Income item operations.
 *
 * Income items are child entities of the Budget aggregate — every mutation
 * returns the full, recalculated Budget so the aggregate stays consistent.
 * These endpoints and payloads are intentionally identical to the previous
 * `budgetService` implementation; this module only separates the concern.
 */
class IncomeService {
  /**
   * Add a single income item to a budget
   */
  async addIncomeItem(budgetId: string, data: AddIncomeItemDTO): Promise<Budget> {
    budgetLogger.debug("Adding income item", {
      budgetId,
      data,
    });
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
      },
    );

    if (status === "error" || statusCode !== 201) {
      budgetLogger.error("Failed to add income item", {
        status,
        statusCode,
        response,
      });
      throw new Error(getApiErrorMessage(response, "Failed to add income item"));
    }

    budgetLogger.info("Income item added successfully", { budgetId });
    return normalizeBudget(response.data);
  }

  /**
   * Update a single income item (PUT /budgets/:id/income/:itemId).
   *
   * Prefer this over `updateIncomeItems` for edits: the bulk PATCH deletes and
   * re-creates every item, which changes their ids and unlinks transactions,
   * and it fails if any other item lacks an account.
   *
   * Returns nothing — the response carries only the item + totals, so callers
   * refetch the budget.
   */
  async updateIncomeItem(budgetId: string, itemId: string, data: AddIncomeItemDTO): Promise<void> {
    budgetLogger.debug("Updating income item", {
      budgetId,
      itemId,
    });
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { response, status, statusCode } = await apiClient.put<ApiResponse<unknown>>(
      `${BASE_URL}/${budgetId}/income/${itemId}`,
      {
        body: JSON.parse(JSON.stringify(data)),
        authentication: {
          token,
        },
        options: {
          requiredAuth: true,
        },
      },
    );

    if (status === "error" || statusCode !== 200) {
      budgetLogger.error("Failed to update income item", {
        status,
        statusCode,
        response,
      });
      throw new Error(getApiErrorMessage(response, "Failed to update income item"));
    }

    budgetLogger.info("Income item updated successfully", { budgetId, itemId });
  }

  /**
   * Update all income items
   */
  async updateIncomeItems(budgetId: string, incomeItems: AddIncomeItemDTO[]): Promise<Budget> {
    budgetLogger.debug("Updating income items", {
      budgetId,
      count: incomeItems.length,
    });
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
      },
    );

    if (status === "error" || statusCode !== 200) {
      budgetLogger.error("Failed to update income items", {
        status,
        statusCode,
        response,
      });
      throw new Error(getApiErrorMessage(response, "Failed to update income items"));
    }

    budgetLogger.info("Income items updated successfully", { budgetId });
    return normalizeBudget(response.data);
  }

  /**
   * Delete an income item
   */
  async deleteIncomeItem(budgetId: string, itemId: string): Promise<Budget> {
    budgetLogger.debug("Deleting income item", {
      budgetId,
      itemId,
    });
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
      },
    );

    if (status === "error" || statusCode !== 200) {
      budgetLogger.error("Failed to delete income item", {
        status,
        statusCode,
        response,
      });
      throw new Error(getApiErrorMessage(response, "Failed to delete income item"));
    }

    budgetLogger.info("Income item deleted successfully", {
      budgetId,
      itemId,
    });
    return normalizeBudget(response.data);
  }
}

export const incomeService = new IncomeService();
