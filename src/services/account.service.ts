/**
 * Account Service
 * Handles bank/financial accounts.
 *
 * Contract: see frontend-integration-guide.md §5.
 */

import { apiClient, getAuthToken } from "@/config/api-client";
import type { ApiResponse, Account, CreateAccountDto, UpdateAccountDto } from "@/types/api";

function requireToken(): string {
  const token = getAuthToken();
  if (!token) { throw new Error("No authentication token found"); }
  return token;
}

class AccountService {
  /**
   * GET /accounts — list all user accounts.
   * Server sends Cache-Control: private, max-age=60 + ETag.
   * Browser handles 304 transparently.
   */
  async getAll(): Promise<ApiResponse<Account[]>> {
    const token = requireToken();

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
   * GET /accounts/:id — single account.
   */
  async getById(id: string): Promise<ApiResponse<Account>> {
    const token = requireToken();

    const { status, response } = await apiClient.get<ApiResponse<Account>>(`/accounts/${id}`, {
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
   * POST /accounts — create a new account.
   * `balance` and `currency` are optional; server defaults to 0 / "MXN".
   */
  async create(data: CreateAccountDto): Promise<ApiResponse<Account>> {
    const token = requireToken();

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
   * PUT /accounts/:id — update account.
   * Guide §5 requires PUT (not PATCH).
   */
  async update(id: string, data: UpdateAccountDto): Promise<ApiResponse<Account>> {
    const token = requireToken();

    const { status, response } = await apiClient.put<ApiResponse<Account>>(`/accounts/${id}`, {
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
   * DELETE /accounts/:id — remove account.
   *
   * Server returns 409 when the account has transactions. The caller should
   * catch that and prompt the user to delete the linked transactions first.
   */
  async remove(id: string): Promise<ApiResponse<Account>> {
    const token = requireToken();

    const { status, response } = await apiClient.delete<ApiResponse<Account>>(`/accounts/${id}`, {
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
