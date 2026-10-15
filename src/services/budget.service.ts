import { postApiBudgetsIdDuplicate } from "@/api/generated/budgets/budgets";
import type { PostApiBudgetsIdDuplicateBody } from "@/api/generated/models";
import { apiClient, getAuthToken } from "@/config/api-client";
import { budgetLogger } from "@/config/logger";
import type { ApiResponse } from "@/types/api";
import type { Budget, BudgetStats, CreateBudgetDTO } from "@/types/budget";
import { normalizeBudget } from "@/utils/budget-totals";
import { ApplicationError } from "@/utils/errors";

const BASE_URL = "/budgets";

/**
 * Budget aggregate operations (CRUD + stats + duplicate).
 *
 * Income and expense child-entity mutations live in `income.service.ts` and
 * `expense.service.ts`. Pure totals math lives in `@/utils/budget-totals`.
 */
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
    if (filters?.year) {
      queryParams.append("year", filters.year.toString());
    }
    if (filters?.month) {
      queryParams.append("month", filters.month.toString());
    }

    const url = queryParams.toString() ? `${BASE_URL}?${queryParams}` : BASE_URL;
    const { response, status, statusCode } = await apiClient.get<ApiResponse<Budget[]>>(url, {
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    const budgets = response?.data || [];

    if (statusCode !== 200) {
      budgetLogger.error("Failed to fetch budgets", {
        status,
        statusCode,
        response,
      });
      throw new Error("Failed to fetch budgets");
    }

    budgetLogger.info("Budgets fetched successfully", { count: response?.data?.length });
    return budgets.map(normalizeBudget);
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

    const { response, status, statusCode } = await apiClient.get<ApiResponse<Budget>>(
      `${BASE_URL}/${id}`,
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
      budgetLogger.error("Failed to fetch budget", {
        status,
        statusCode,
        response,
      });
      throw new Error(response?.message || "Failed to fetch budget");
    }

    budgetLogger.info("Budget fetched successfully", { id });
    return normalizeBudget(response.data);
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

    const { response, status, statusCode } = await apiClient.get<ApiResponse<BudgetStats>>(
      `${BASE_URL}/stats`,
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
      budgetLogger.error("Failed to fetch budget stats", {
        status,
        statusCode,
        response,
      });
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
      budgetLogger.error("Failed to create budget", {
        status,
        statusCode,
        response,
      });
      throw new Error(response?.message || "Failed to create budget");
    }

    budgetLogger.info("Budget created successfully", { id: response.data.id });
    return normalizeBudget(response.data);
  }

  /**
   * Update budget
   */
  async updateBudget(id: string, data: Partial<CreateBudgetDTO>): Promise<Budget> {
    budgetLogger.debug("Updating budget", {
      id,
      data,
    });
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { response, status, statusCode } = await apiClient.put<ApiResponse<Budget>>(
      `${BASE_URL}/${id}`,
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
      budgetLogger.error("Failed to update budget", {
        status,
        statusCode,
        response,
      });
      throw new Error(response?.message || "Failed to update budget");
    }

    budgetLogger.info("Budget updated successfully", { id });
    return normalizeBudget(response.data);
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

    const { response, status, statusCode } = await apiClient.delete<ApiResponse<void>>(
      `${BASE_URL}/${id}`,
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
      budgetLogger.error("Failed to delete budget", {
        status,
        statusCode,
        response,
      });
      throw new Error(response?.message || "Failed to delete budget");
    }

    budgetLogger.info("Budget deleted successfully", { id });
  }

  /**
   * Duplicate an existing budget into a new (year, month).
   * Clones incomeItems and expenseItems — transactions are NOT copied.
   *
   * POST /api/budgets/:id/duplicate
   *
   * Errors: the Orval mutator throws an `AppError` built from the backend
   * envelope on any non-2xx, so callers branch on `error.code`:
   *   - BUDGET_ALREADY_EXISTS     (409) → target period already has a budget
   *   - STALE_ACCOUNT_REFERENCES  (400) → source references a deleted account (message lists ids)
   *   - VALIDATION_ERROR / INVALID_MONTH (400) → year/month out of range
   *   - BUDGET_NOT_FOUND          (404) → source gone, or owned by another user
   *     (the backend answers 404, not 403, so budget ids can't be probed)
   *
   * TODO(spec): the spec's response.data is typed `Record<string, unknown>`;
   * once the backend declares the Budget schema for this route, drop the cast.
   */
  async duplicateBudget(sourceId: string, body: PostApiBudgetsIdDuplicateBody): Promise<Budget> {
    budgetLogger.debug("Duplicating budget", { sourceId, ...body });

    const res = await postApiBudgetsIdDuplicate(sourceId, body);
    const created = res.data?.data as Budget | undefined;
    if (!created) {
      budgetLogger.error("Duplicate succeeded but response.data was empty");
      throw new ApplicationError(
        "Server returned an empty response. Please refresh and try again.",
        "INVALID_RESPONSE",
        500,
      );
    }
    budgetLogger.info("Budget duplicated successfully", { sourceId, newId: created.id });
    return created;
  }
}

export const budgetService = new BudgetService();
