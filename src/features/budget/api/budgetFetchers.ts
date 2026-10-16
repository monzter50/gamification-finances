import { apiClient, getAuthToken } from "@/config/api-client";
import { normalizeBudget } from "@/features/budget/model/budget-totals";
import { AppError, errorFromResponse, normalizeError } from "@/shared/errors";
import type { ApiResponse } from "@/types/api";
import type { Budget } from "@/types/budget";

/*
 * Legacy fetchers for budget endpoints the OpenAPI spec doesn't document yet.
 * Moved here from src/services/budget.service.ts; delete each one as soon as
 * its route lands in the spec and the generated client covers it.
 */

export interface BudgetListFilters {
  year?: number;
  /** 0-based month. */
  month?: number;
}

export interface BudgetPeriod {
  year: number;
  /** 0-based month. */
  month: number;
}

const authOptions = () => {
  const token = getAuthToken();
  if (!token) {
    throw new AppError({
      message: "No authentication token found",
      kind: "unauthorized",
      status: 401,
    });
  }
  return { authentication: { token }, options: { requiredAuth: true } };
};

/**
 * api-core already throws on non-2xx (status only — the body is dropped, see
 * normalizeError). This guards the rest: no status, or an unexpected 2xx.
 */
const ensureOk = <T>(
  result: { response: ApiResponse<T>; statusCode?: number },
  expected: number,
): T => {
  if (result.statusCode !== expected) {
    // No status = the request never got a response (offline, CORS, DNS).
    if (result.statusCode === undefined) {
      throw new AppError({ message: "Network request failed", kind: "network" });
    }
    throw errorFromResponse(result.statusCode, result.response);
  }
  return result.response.data;
};

// TODO(openapi): GET /budgets missing from spec
export const fetchBudgets = async (filters: BudgetListFilters = {}): Promise<Budget[]> => {
  const params = new URLSearchParams();
  if (filters.year !== undefined) params.append("year", String(filters.year));
  if (filters.month !== undefined) params.append("month", String(filters.month));
  const query = params.toString();

  const result = await apiClient.get<ApiResponse<Budget[]>>(
    query ? `/budgets?${query}` : "/budgets",
    authOptions(),
  );
  return (ensureOk(result, 200) ?? []).map(normalizeBudget);
};

// TODO(openapi): GET /budgets/{id} missing from spec
export const fetchBudget = async (id: string): Promise<Budget> => {
  const result = await apiClient.get<ApiResponse<Budget>>(`/budgets/${id}`, authOptions());
  return normalizeBudget(ensureOk(result, 200));
};

// TODO(openapi): POST /budgets missing from spec
export const createBudget = async ({ year, month }: BudgetPeriod): Promise<Budget> => {
  try {
    const result = await apiClient.post<ApiResponse<Budget>>("/budgets", {
      body: { year, month },
      ...authOptions(),
    });
    return normalizeBudget(ensureOk(result, 201));
  } catch (err) {
    // The legacy client drops the body; on create a 409 can only mean the
    // period is taken — restore the backend's errorCode so the copy is right.
    const e = normalizeError(err);
    if (e.status === 409) {
      throw new AppError({
        message: e.message,
        status: 409,
        code: "BUDGET_ALREADY_EXISTS",
        cause: err,
      });
    }
    throw e;
  }
};
