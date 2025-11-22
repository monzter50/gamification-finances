/**
 * Transaction Service
 * Handles financial transactions
 */

import type { ApiResponse } from "@aglaya/api-core";

import { apiClient, getAuthToken } from "@/config/api-client";
import type {
  Transaction,
  CreateTransactionRequest,
  TransactionSummary,
} from "@/types/api";

class TransactionService {
  /**
   * Get all user transactions
   * GET /transactions
   */
  async getAll(): Promise<ApiResponse<Transaction[]>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await apiClient.get<Transaction[]>("/transactions", {
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    return response;
  }

  /**
   * Create a new transaction
   * POST /transactions
   */
  async create(data: CreateTransactionRequest): Promise<ApiResponse<Transaction>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await apiClient.post<Transaction>("/transactions", {
      body: { ...data },
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    return response;
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

    const response = await apiClient.get<Transaction>(`/transactions/${id}`, {
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    return response;
  }

  /**
   * Update transaction
   * PUT /transactions/:id
   */
  async update(id: string, data: Partial<CreateTransactionRequest>): Promise<ApiResponse<Transaction>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await apiClient.put<Transaction>(`/transactions/${id}`, {
      body: { ...data },
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    return response;
  }

  /**
   * Delete transaction
   * DELETE /transactions/:id
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await apiClient.delete<void>(`/transactions/${id}`, {
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    return response;
  }

  /**
   * Get financial summary
   * GET /transactions/summary
   */
  async getSummary(): Promise<ApiResponse<TransactionSummary>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await apiClient.get<TransactionSummary>("/transactions/summary", {
      authentication: {
        token,
      },
      options: {
        requiredAuth: true,
      },
    });

    return response;
  }

  /**
   * Get monthly summary
   * GET /transactions/monthly/:year/:month
   */
  async getMonthlySummary(year: number, month: number): Promise<ApiResponse<TransactionSummary>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await apiClient.get<TransactionSummary>(
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

    return response;
  }
}

export const transactionService = new TransactionService();
