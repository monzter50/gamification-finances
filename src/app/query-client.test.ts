import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { invalidateFor } from "@/api/invalidation";
import { queryKeys } from "@/api/query-keys";
import { unwrap, unwrapData } from "@/api/unwrap";
import { queryClient } from "@/app/query-client";
import { AppError } from "@/shared/errors";

vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }));
const { toast } = await import("@/hooks/use-toast");

// eslint-disable-next-line no-unused-vars -- param names in a function type
const retry = queryClient.getDefaultOptions().queries?.retry as (n: number, e: unknown) => boolean;

describe("queryClient defaults", () => {
  it("retries network / 5xx / 429 up to twice", () => {
    expect(retry(0, new TypeError("Failed to fetch"))).toBe(true);
    expect(retry(1, new AppError({ message: "x", status: 503 }))).toBe(true);
    expect(retry(2, new AppError({ message: "x", status: 503 }))).toBe(false);
  });

  it("never retries client errors", () => {
    expect(retry(0, new AppError({ message: "x", status: 400 }))).toBe(false);
    expect(retry(0, new AppError({ message: "x", status: 404 }))).toBe(false);
  });

  it("toasts failed mutations with the meta title", async () => {
    await queryClient
      .getMutationCache()
      .build(queryClient, {
        mutationFn: () => Promise.reject(new AppError({ message: "x", status: 500 })),
        meta: { errorTitle: "Couldn't save budget" },
      })
      .execute(undefined)
      .catch(() => undefined);

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "destructive", title: "Couldn't save budget" }),
    );
  });

  it("stays quiet for silent mutations", async () => {
    vi.mocked(toast).mockClear();
    await queryClient
      .getMutationCache()
      .build(queryClient, {
        mutationFn: () => Promise.reject(new AppError({ message: "y", status: 400 })),
        meta: { silent: true },
      })
      .execute(undefined)
      .catch(() => undefined);

    expect(toast).not.toHaveBeenCalled();
  });
});

describe("invalidateFor", () => {
  it("marks every dependent of a transaction stale", async () => {
    const qc = new QueryClient();
    for (const key of [
      queryKeys.accounts.list(),
      queryKeys.budgets.detail("b1"),
      queryKeys.budgets.income("b1", { page: 1 }),
      queryKeys.transactions.list({ page: 1 }),
      queryKeys.gamification.userAchievements(),
      queryKeys.user.stats(),
    ]) {
      qc.setQueryData(key, {});
    }

    await invalidateFor(qc, "transaction");

    const stale = qc
      .getQueryCache()
      .getAll()
      .filter((q) => q.state.isInvalidated);
    expect(stale).toHaveLength(6);
  });

  it("leaves unrelated queries alone", async () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.accounts.list(), {});
    qc.setQueryData(queryKeys.budgets.detail("b1"), {});

    await invalidateFor(qc, "budget");

    expect(qc.getQueryState(queryKeys.accounts.list())?.isInvalidated).toBe(false);
    expect(qc.getQueryState(queryKeys.budgets.detail("b1"))?.isInvalidated).toBe(true);
  });
});

describe("unwrap", () => {
  const ok = <B>(body: B) =>
    Promise.resolve({ status: 200 as const, data: body, headers: new Headers() });

  it("returns the body", async () => {
    await expect(
      unwrap(ok({ success: true, data: [1], pagination: { page: 1 } })),
    ).resolves.toEqual({
      success: true,
      data: [1],
      pagination: { page: 1 },
    });
  });

  it("unwrapData returns the envelope's data and rejects when missing", async () => {
    await expect(unwrapData(ok({ success: true, data: { id: "a" } }))).resolves.toEqual({
      id: "a",
    });
    await expect(unwrapData(ok({ success: true }))).rejects.toBeInstanceOf(AppError);
  });
});
