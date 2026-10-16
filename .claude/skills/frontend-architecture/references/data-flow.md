# Data flow — from OpenAPI to pixels

```
backend openapi-schema.json
   │  yarn api:sync  (copies to openapi/openapi.json, then orval.config.ts)
   ▼
src/api/generated/<tag>/*.ts     typed fetch functions, e.g. postApiBudgetsIdIncome
   │  every call goes through
   ▼
src/api/orval-mutator.ts         auth header, error body → AppError, 440 → session revoked
   │  wrapped by
   ▼
features/<domain>/api/           queryOptions factories + useMutation hooks, keyed by queryKeys
   │  consumed by
   ▼
features/<domain>/components/    useQuery / useSuspenseQuery / mutation.mutate
```

Why hand-written `queryOptions` over Orval's `client: "react-query"` mode:
Orval groups by **OpenAPI tag** (income, expense) while our cache is grouped
by **aggregate** (a budget owns its items). Hand-written factories let keys
follow the aggregate so one invalidation refreshes everything that depends
on a budget. The cost is ~10 lines per endpoint; worth it for control over
keys and the non-uniform mutation responses.

## Query-key registry

One file. Hierarchical, so invalidating a parent invalidates children.

```ts
// src/api/query-keys.ts
export const queryKeys = {
  budgets: {
    all: ["budgets"] as const,
    list: (params?: BudgetListParams) => ["budgets", "list", params ?? {}] as const,
    detail: (id: string) => ["budgets", "detail", id] as const,
    income: (id: string, params?: ItemListParams) =>
      ["budgets", "detail", id, "income", params ?? {}] as const,
    expense: (id: string, params?: ItemListParams) =>
      ["budgets", "detail", id, "expense", params ?? {}] as const,
  },
  accounts: {
    all: ["accounts"] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    list: (params: TransactionListParams) => ["transactions", "list", params] as const,
    summary: (params: SummaryParams) => ["transactions", "summary", params] as const,
  },
  user: {
    me: ["user", "me"] as const,
  },
} as const;
```

`invalidateQueries({ queryKey: queryKeys.budgets.detail(id) })` also
refreshes that budget's income and expense lists — that's the point of
nesting.

## Queries

```ts
// src/features/budget/api/budgetQueries.ts
import { queryOptions } from "@tanstack/react-query";

import { getApiBudgetsIdIncome } from "@/api/generated/income/income";
import { queryKeys } from "@/api/query-keys";
import { unwrap } from "@/api/unwrap";
import { fetchBudget } from "@/features/budget/api/budgetFetchers"; // legacy — remove when in spec

export const budgetDetailQuery = (id: string) =>
  queryOptions({
    queryKey: queryKeys.budgets.detail(id),
    // TODO(openapi): GET /budgets/:id missing from spec — legacy fetcher
    // (it normalizes at the boundary; derive anything else in `select`, never in useEffect)
    queryFn: () => fetchBudget(id),
  });

export const budgetIncomeQuery = (id: string, params: ItemListParams) =>
  queryOptions({
    queryKey: queryKeys.budgets.income(id, params),
    queryFn: () => unwrap(getApiBudgetsIdIncome(id, params)),
    placeholderData: keepPreviousData, // pagination without flicker
  });
```

Rules:

- Export **factories**, not hooks. A factory works in `useQuery`,
  `useSuspenseQuery`, `prefetchQuery`, and route loaders.
- Derived values (`select`, or computed inline in render) — never
  `useEffect` + `setState`.
- Loading UI: `<Skeleton>` matching final shape (design-system rule).

## Mutations

One hook per file. The hook owns its cache side-effects; the component only
calls `mutate` and reacts to `isPending`/`error`.

```ts
// Full aggregate returned → write it straight into the cache
export const useUpdateIncomeItems = (budgetId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: UpdateIncomeItemsRequest) =>
      unwrap(patchApiBudgetsIdIncome(budgetId, items)),
    onSuccess: (budget) => {
      qc.setQueryData(queryKeys.budgets.detail(budgetId), budget);
      qc.invalidateQueries({ queryKey: [...queryKeys.budgets.detail(budgetId), "income"] });
    },
  });
};

// Partial returned → invalidate, never setQueryData a partial
export const useCreateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.transactions.all }),
        qc.invalidateQueries({ queryKey: queryKeys.accounts.all }), // balance changed
        qc.invalidateQueries({ queryKey: queryKeys.budgets.all }), // totals changed
      ]),
  });
};
```

Returning the `Promise.all` keeps `isPending` true until the refetch lands —
no flash of stale totals.

### Which mutations return what (current backend)

| Endpoint                                 | Returns                                | Cache action                                 |
| ---------------------------------------- | -------------------------------------- | -------------------------------------------- |
| PATCH `/budgets/:id/income` / `/expense` | `BudgetMutationResponse` (full budget) | `setQueryData` detail                        |
| POST `/budgets/:id/income` / `/expense`  | item + totals                          | invalidate detail                            |
| PUT `/budgets/:id/income/:itemId`        | item + totals                          | invalidate detail                            |
| DELETE `/budgets/:id/income/:itemId`     | `ItemRemovalResponse`                  | invalidate detail                            |
| any transaction create/update/delete     | transaction                            | invalidate transactions + accounts + budgets |

Check the generated model's JSDoc before assuming — it states the shape.

## Optimistic updates

Only for inline edits where latency is visible (Notion-style cells). Use the
`onMutate` snapshot → `onError` rollback → `onSettled` invalidate pattern.
Don't use optimistic updates for money totals computed server-side —
invalidate instead.

## Errors

All error handling goes through `@/shared/errors` (src/shared/errors/).

```
fetch / backend envelope / legacy ApplicationError / render crash
        │ normalizeError()  — every boundary
        ▼
AppError { kind, code, status, fieldErrors, isRetryable, isUnexpected }
        │
        ├─ toUserMessage(err)      copy: known code → field msgs → safe 4xx msg → kind fallback
        ├─ reportError(err, ctx)   logger today; setErrorReporter() for Sentry later
        ├─ notifyError(err, opts)  report + toast (deduped; skips kind "session")
        ├─ applyFieldErrors(...)   backend validation → react-hook-form setError
        ├─ <ErrorPanel error onRetry>   inline failed-to-load state
        └─ RouteErrorPage          React Router errorElement (page crashes)
```

Rules:

- The mutator throws `AppError` built from the backend body
  (`{ message, errorCode, errors[] }`). Don't re-catch to rethrow or rewrap.
- Branch on `error.kind` (how to react) or `error.code` (which case) —
  never on `error.message` text.
- **Query failed** → `<ErrorPanel error={q.error} onRetry={q.refetch} />` in
  place of the content. No toast.
- **Mutation failed** → validation: `applyFieldErrors` + form message;
  anything else: `notifyError(err, { title: "Couldn't save …" })`. When React
  Query lands, the global `MutationCache.onError` calls `notifyError`; opt out
  with `meta: { silent: true }` when the form shows the error inline.
- **Expected but invisible** (background refresh, analytics) → `reportError`.
- **Never** show `error.message` to users — always `toUserMessage(error)`.
- New backend `errorCode` → add it to `error-codes.ts` and, if it needs
  friendlier copy, to `messages.ts`.
- Kind `session` is owned by `SessionBlockedGate`; don't toast it.

## `unwrap`

The mutator returns Orval's `{ status, data, headers }` (non-2xx already
threw). `unwrap` extracts the payload so feature code never sees the
envelope:

```ts
// src/api/unwrap.ts
export const unwrap = async <T extends { data: unknown }>(
  res: Promise<T>,
): Promise<Extract<T, { status: 200 | 201 }>["data"]> =>
  (await res).data as Extract<T, { status: 200 | 201 }>["data"];
```

Verify against the real response on first use — if the backend body is
`{ success, data, message }`, unwrap one level deeper here, once, not in
every feature.

## Testing

- Network mocked at the HTTP layer with MSW (`src/test/server.ts`) — never
  `vi.mock("@/services/…")`.
- Render with `renderWithProviders` (`src/test/render.tsx`): fresh
  `QueryClient` per test with the app's error routing and `retry: false`.
- Test mutations by asserting the UI after the invalidation refetch, not by
  spying on `invalidateQueries`.
