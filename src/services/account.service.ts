/**
 * Account Service
 * Handles bank/financial accounts
 */

import { apiClient, getAuthToken } from "@/config/api-client";
import type { ApiResponse, Account, CreateAccountDto, UpdateAccountDto } from "@/types/api";

class AccountService {
  /**
   * Create a new account
   * POST /accounts
   */
  async create(data: CreateAccountDto): Promise<ApiResponse<Account>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { status, response } = await apiClient.post<ApiResponse<Account>>("/accounts", {
      body: { ...data },
      authentication: { token },
      options: { requiredAuth: true },
    });

    return {
      success: status === "ok",
      data: response?.data,
      message: response?.message ?? "",
    };
  }

  /**
   * Get all user accounts
   * GET /accounts
   */
  async getAll(): Promise<ApiResponse<Account[]>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { status, response } = await apiClient.get<ApiResponse<Account[]>>("/accounts", {
      authentication: { token },
      options: { requiredAuth: true },
    });

    return {
      success: status === "ok",
      data: response?.data ?? [],
      message: response?.message ?? "",
    };
  }

  /**
   * Update an account
   * PATCH /accounts/:id
   */
  async update(id: string, data: UpdateAccountDto): Promise<ApiResponse<Account>> {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const { status, response } = await apiClient.patch<ApiResponse<Account>>(`/accounts/${id}`, {
      body: { ...data },
      authentication: { token },
      options: { requiredAuth: true },
    });

    return {
      success: status === "ok",
      data: response?.data,
      message: response?.message ?? "",
    };
  }
}

export const accountService = new AccountService();
