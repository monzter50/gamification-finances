import { expectStatus, legacyAuth } from "@/api/legacy-client";
import { apiClient } from "@/config/api-client";
import { normalizeBudget } from "@/features/budget/model/budget-totals";
import { AppError, normalizeError } from "@/shared/errors";
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

// TODO(openapi): GET /budgets missing from spec
export const fetchBudgets = async (filters: BudgetListFilters = {}): Promise<Budget[]> => {
  const params = new URLSearchParams();
  if (filters.year !== undefined) params.append("year", String(filters.year));
  if (filters.month !== undefined) params.append("month", String(filters.month));
  const query = params.toString();

  const result = await apiClient.get<ApiResponse<Budget[]>>(
    query ? `/budgets?${query}` : "/budgets",
    legacyAuth(),
  );
  return (expectStatus(result, 200).data ?? []).map(normalizeBudget);
};

// TODO(openapi): GET /budgets/{id} missing from spec
export const fetchBudget = async (id: string): Promise<Budget> => {
  const result = await apiClient.get<ApiResponse<Budget>>(`/budgets/${id}`, legacyAuth());
  return normalizeBudget(expectStatus(result, 200).data);
};

// TODO(openapi): POST /budgets missing from spec
export const createBudget = async ({ year, month }: BudgetPeriod): Promise<Budget> => {
  try {
    const result = await apiClient.post<ApiResponse<Budget>>("/budgets", {
      body: { year, month },
      ...legacyAuth(),
    });
    return normalizeBudget(expectStatus(result, 201).data);
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
