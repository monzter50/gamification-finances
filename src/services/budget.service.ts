import { postApiBudgetsIdDuplicate } from "@/api/generated/budgets/budgets";
import type { PostApiBudgetsIdDuplicateBody } from "@/api/generated/models";
import { apiClient, getAuthToken } from "@/config/api-client";
import { budgetLogger } from "@/config/logger";
import type { ApiResponse, Pagination } from "@/types/api";
import type {
  AddExpenseItemDTO,
  AddIncomeItemDTO,
  Budget,
  BudgetStats,
  CreateBudgetDTO,
  IncomeItem,
  ExpenseItem,
  PaginationParams,
  PaginatedResponse,
} from "@/types/budget";
import { ApplicationError } from "@/utils/errors";

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
        response
      });
      throw new Error("Failed to fetch budgets");
    }

    budgetLogger.info("Budgets fetched successfully", { count: response?.data?.length });
    return budgets;
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
      budgetLogger.error("Failed to fetch budget", {
        status,
        statusCode,
        response
      });
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
      budgetLogger.error("Failed to fetch budget stats", {
        status,
        statusCode,
        response
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
        response
      });
      throw new Error(response?.message || "Failed to create budget");
    }

    budgetLogger.info("Budget created successfully", { id: response.data.id });
    return response.data;
  }

  /**
   * Update budget
   */
  async updateBudget(id: string, data: Partial<CreateBudgetDTO>): Promise<Budget> {
    budgetLogger.debug("Updating budget", {
      id,
      data
    });
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
      budgetLogger.error("Failed to update budget", {
        status,
        statusCode,
        response
      });
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
      budgetLogger.error("Failed to delete budget", {
        status,
        statusCode,
        response
      });
      throw new Error(response?.message || "Failed to delete budget");
    }

    budgetLogger.info("Budget deleted successfully", { id });
  }

  /**
   * Add a single income item to a budget
   */
  async addIncomeItem(budgetId: string, data: AddIncomeItemDTO): Promise<Budget> {
    budgetLogger.debug("Adding income item", {
      budgetId,
      data
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
      }
    );

    if (status === "error" || statusCode !== 201) {
      budgetLogger.error("Failed to add income item", {
        status,
        statusCode,
        response
      });
      throw new Error(response?.message || "Failed to add income item");
    }

    budgetLogger.info("Income item added successfully", { budgetId });
    return response.data;
  }

  /**
   * Update all income items
   */
  async updateIncomeItems(budgetId: string, incomeItems: AddIncomeItemDTO[]): Promise<Budget> {
    budgetLogger.debug("Updating income items", {
      budgetId,
      count: incomeItems.length
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
      }
    );

    if (status === "error" || statusCode !== 200) {
      budgetLogger.error("Failed to update income items", {
        status,
        statusCode,
        response
      });
      throw new Error(response?.message || "Failed to update income items");
    }

    budgetLogger.info("Income items updated successfully", { budgetId });
    return response.data;
  }

  /**
   * Delete an income item
   */
  async deleteIncomeItem(budgetId: string, itemId: string): Promise<Budget> {
    budgetLogger.debug("Deleting income item", {
      budgetId,
      itemId
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
      }
    );

    if (status === "error" || statusCode !== 200) {
      budgetLogger.error("Failed to delete income item", {
        status,
        statusCode,
        response
      });
      throw new Error(response?.message || "Failed to delete income item");
    }

    budgetLogger.info("Income item deleted successfully", {
      budgetId,
      itemId
    });
    return response.data;
  }

  /**
   * Get paginated income items
   */
  async getIncomeItemsPaginated(
    budgetId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<IncomeItem>> {
    budgetLogger.debug("Fetching paginated income items", {
      budgetId,
      params,
    });
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const queryParams = new URLSearchParams();
    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    const url = queryParams.toString()
      ? `${BASE_URL}/${budgetId}/income?${queryParams}`
      : `${BASE_URL}/${budgetId}/income`;

    const { response, status, statusCode } = await apiClient.get<ApiResponse<IncomeItem[]> & { pagination: Pagination }>(url, {
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    if (status === "error" || statusCode !== 200) {
      budgetLogger.error("Failed to fetch paginated income items", {
        status,
        statusCode,
        response,
      });
      throw new Error(response?.message || "Failed to fetch income items");
    }

    budgetLogger.info("Paginated income items fetched successfully", { budgetId });
    return {
      items: response.data ?? [],
      pagination: {
        page: response.pagination.page,
        pages: response.pagination.pages,
        total: response.pagination.total,
        limit: response.pagination.limit
      }
    };
  }

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

  /**
   * Get paginated expense items
   */
  async getExpenseItemsPaginated(
    budgetId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<ExpenseItem>> {
    budgetLogger.debug("Fetching paginated expense items", {
      budgetId,
      params,
    });
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const queryParams = new URLSearchParams();
    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    const url = queryParams.toString()
      ? `${BASE_URL}/${budgetId}/expense?${queryParams}`
      : `${BASE_URL}/${budgetId}/expense`;

    const { response, status, statusCode } = await apiClient.get<ApiResponse<ExpenseItem[]> & { pagination: Pagination }>(url, {
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    if (status === "error" || statusCode !== 200) {
      budgetLogger.error("Failed to fetch paginated expense items", {
        status,
        statusCode,
        response,
      });
      throw new Error(response?.message || "Failed to fetch expense items");
    }

    budgetLogger.info("Paginated expense items fetched successfully", { budgetId });
    return {
      items: response.data ?? [],
      pagination: {
        page: response.pagination.page,
        pages: response.pagination.pages,
        total: response.pagination.total,
        limit: response.pagination.limit
      }
    };
  }

  /**
   * Duplicate an existing budget into a new (year, month).
   * Clones incomeItems and expenseItems — transactions are NOT copied.
   *
   * POST /api/budgets/:id/duplicate
   *
   * Maps server errors to ApplicationError with discriminating `code`s so
   * UI can branch:
   *   - BUDGET_CONFLICT (409) → target period already has a budget
   *   - STALE_ACCOUNT   (400) → source references a deleted account
   *   - VALIDATION      (400) → year/month out of range or extra fields
   *   - NOT_FOUND       (404) → source budget gone
   *   - FORBIDDEN       (403) → source belongs to another user
   *
   * TODO(spec): the spec's response.data is typed `Record<string, unknown>`;
   * once the backend declares the Budget schema for this route, drop the cast.
   */
  async duplicateBudget(sourceId: string, body: PostApiBudgetsIdDuplicateBody): Promise<Budget> {
    budgetLogger.debug("Duplicating budget", { sourceId, ...body });

    const res = await postApiBudgetsIdDuplicate(sourceId, body);

    if (res.status === 201) {
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

    // Error branches — pull the server-provided message when present.
    const message = (res.data as { error?: string; message?: string } | undefined)?.error
                 ?? (res.data as { message?: string } | undefined)?.message
                 ?? "";

    budgetLogger.warn("Duplicate failed", { status: res.status, message });

    if (res.status === 409) {
      throw new ApplicationError(
        message || "A budget already exists for that period.",
        "BUDGET_CONFLICT",
        409,
      );
    }
    if (res.status === 400 && message.startsWith("Cannot duplicate:")) {
      // Business-rule 400: source references an account the user no longer owns.
      // Message lists the offending account ids; surface it verbatim.
      throw new ApplicationError(message, "STALE_ACCOUNT", 400);
    }
    if (res.status === 400) {
      throw new ApplicationError(
        message || "Invalid year or month.",
        "VALIDATION",
        400,
      );
    }
    if (res.status === 403) {
      throw new ApplicationError("You don't own this budget.", "FORBIDDEN", 403);
    }
    if (res.status === 404) {
      throw new ApplicationError("Source budget no longer exists.", "NOT_FOUND", 404);
    }

    throw new ApplicationError(
      message || "Failed to duplicate budget.",
      "DUPLICATE_FAILED",
      res.status,
    );
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
