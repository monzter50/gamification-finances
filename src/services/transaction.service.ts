/**
 * Transaction Service
 * Handles financial transactions
 */

import { apiClient, getAuthToken } from "@/config/api-client";
import type {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFilters,
  PaginatedResponse,
  FinancialSummary,
  MonthlySummary,
  BudgetBalance,
  ApiResponse,
  Pagination,
  TransactionTotals,
} from "@/types/api";

class TransactionService {
  /**
   * Get all user transactions with optional filters and pagination
   * GET /transactions
   */
  async getAll(filters?: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const params = new URLSearchParams();

    if (filters?.page) { params.append("page", filters.page.toString()); }
    if (filters?.limit) { params.append("limit", filters.limit.toString()); }
    if (filters?.type) { params.append("type", filters.type); }
    if (filters?.budgetId) { params.append("budgetId", filters.budgetId); }
    if (filters?.startDate) { params.append("startDate", filters.startDate); }
    if (filters?.endDate) { params.append("endDate", filters.endDate); }

    const queryString = params.toString();
    const url = `/transactions${queryString ? `?${queryString}` : ""}`;

    const { response, status } = await apiClient.get<
      ApiResponse<Transaction[]> & { pagination: Pagination; totals?: TransactionTotals }
    >(url, {
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    // Transform ApiResponse to PaginatedResponse format
    // Note: Adjust this based on your actual API response structure
    return {
      success: status === "ok",
      data: response?.data ?? [],
      pagination: {
        page: response.pagination.page,
        pages: response.pagination.pages,
        total: response.pagination.total,
        limit: response.pagination.limit
      },
      ...(response.totals ? { totals: response.totals } : {}),
      message: response.message ?? "Transactions retrieved successfully"
    };
  }

  /**
   * Get specific transaction by ID
   * GET /transactions/:id
   */
  async getById(id: string): Promise<ApiResponse<Transaction>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { status, response } = await apiClient.get<ApiResponse<Transaction>>(`/transactions/${id}`, {
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    return {
      success: status ==="ok",
      data:response.data,
      message: response.message ?? ""
    };
  }

  /**
   * Create a new transaction
   * POST /transactions
   */
  async create(data: CreateTransactionDto): Promise<ApiResponse<Transaction>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { status,response } = await apiClient.post<ApiResponse<Transaction>>("/transactions", {
      body: { ...data },
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    return {
      success: status === "ok",
      data:response?.data,
      message:response?.message
    };
  }

  /**
   * Update transaction
   * PUT /transactions/:id
   */
  async update(id: string, data: UpdateTransactionDto): Promise<ApiResponse<Transaction>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { status, response } = await apiClient.put<ApiResponse<Transaction>>(`/transactions/${id}`, {
      body: { ...data },
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    return {
      success: status === "ok",
      data: response?.data,
      message: response?.message,
    };
  }

  /**
   * Delete transaction (restores budget balance)
   * DELETE /transactions/:id
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { status, response } = await apiClient.delete<ApiResponse<void>>(`/transactions/${id}`, {
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    return {
      success: status === "ok",
      data: response?.data,
      message: response?.message,
    };
  }

  /**
   * Get financial summary for all transactions
   * GET /transactions/summary
   */
  async getSummary(): Promise<ApiResponse<FinancialSummary>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { status, response } = await apiClient.get<ApiResponse<FinancialSummary>>("/transactions/summary", {
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    return {
      success: status === "ok",
      data: response?.data,
      message: response?.message,
    };
  }

  /**
   * Get monthly summary with category breakdown
   * GET /transactions/monthly/:year/:month
   */
  async getMonthlySummary(year: number, month: number): Promise<ApiResponse<MonthlySummary>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { status, response } = await apiClient.get<ApiResponse<MonthlySummary>>(
      `/transactions/monthly/${year}/${month}`,
      {
        authentication: {
          token,
        },
        options: {
          requiredAuth: true,
        },
      }
    );

    return {
      success: status === "ok",
      data: response?.data,
      message: response?.message,
    };
  }

  /**
   * Get budget balance breakdown showing spent vs budgeted
   * GET /transactions/budget/:budgetId/balance
   */
  async getBudgetBalance(budgetId: string): Promise<ApiResponse<BudgetBalance>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { status, response } = await apiClient.get<ApiResponse<BudgetBalance>>(
      `/transactions/budget/${budgetId}/balance`,
      {
        authentication: {
          token,
        },
        options: {
          requiredAuth: true,
        },
      }
    );

    return {
      success: status === "ok",
      data: response?.data,
      message: response?.message,
    };
  }
}

export const transactionService = new TransactionService();
