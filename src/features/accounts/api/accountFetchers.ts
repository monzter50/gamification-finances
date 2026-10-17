import { expectStatus, legacyAuth } from "@/api/legacy-client";
import { apiClient } from "@/config/api-client";
import type { Account, ApiResponse, CreateAccountDto, UpdateAccountDto } from "@/types/api";

/*
 * Legacy fetchers: /accounts isn't in the OpenAPI spec yet. Moved from
 * src/services/account.service.ts; delete each when its route lands in the spec.
 */

// TODO(openapi): GET /accounts missing from spec
// The server sends ETag + max-age=60; the browser turns a 304 into a 200.
export const fetchAccounts = async (): Promise<Account[]> => {
  const result = await apiClient.get<ApiResponse<Account[]>>("/accounts", legacyAuth());
  return expectStatus(result, 200).data ?? [];
};

// TODO(openapi): POST /accounts missing from spec
export const createAccount = async (dto: CreateAccountDto): Promise<Account> => {
  const result = await apiClient.post<ApiResponse<Account>>("/accounts", {
    body: { ...dto },
    ...legacyAuth(),
  });
  return expectStatus(result, 201).data;
};

// TODO(openapi): PUT /accounts/:id missing from spec
export const updateAccount = async (id: string, dto: UpdateAccountDto): Promise<Account> => {
  const result = await apiClient.put<ApiResponse<Account>>(`/accounts/${id}`, {
    body: { ...dto },
    ...legacyAuth(),
  });
  return expectStatus(result, 200).data;
};

/** 409 when the account still has transactions (see useDeleteAccount). */
// TODO(openapi): DELETE /accounts/:id missing from spec
export const deleteAccount = async (id: string): Promise<void> => {
  const result = await apiClient.delete<ApiResponse<Account>>(`/accounts/${id}`, legacyAuth());
  expectStatus(result, 200);
};
