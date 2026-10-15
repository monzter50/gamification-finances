# Migration: layered → feature-sliced + React Query

## Step 0 — bootstrap (once, its own PR: `chore/react-query-setup`)

Not done yet. Required before any slice migration.

1. `npm i @tanstack/react-query` and `npm i -D @tanstack/react-query-devtools`
   (check bundle impact: ~13 kB gz — acceptable, it replaces hand-rolled
   loading/error/refetch code in every hook).
2. Create `src/app/query-client.ts`:
   ```ts
   export const queryClient = new QueryClient({
     defaultOptions: {
       queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
     },
     mutationCache: new MutationCache({
       onError: (err, _vars, _ctx, mutation) => {
         if (mutation.meta?.silent) return;
         notifyError(err); // from @/shared/errors
       },
     }),
   });
   ```
3. Wrap the app in `<QueryClientProvider client={queryClient}>` (inside
   `AuthProvider`'s parent so auth can call `queryClient.clear()` on logout).
4. Create `src/api/query-keys.ts` and `src/api/unwrap.ts` (see data-flow.md).
5. On logout / session revoked: `queryClient.clear()` — no cached data
   survives a user switch.

Testing: Vitest + jsdom are installed (`npm test`). React Testing Library
and MSW are not yet — add them when the first component test needs them.

## Legacy → target map

| Legacy                                         | Target                                                       |
| ---------------------------------------------- | ------------------------------------------------------------ |
| `src/services/budget.service.ts`               | `features/budget/api/*` (generated client where available)   |
| `src/services/income.service.ts`, `expense.service.ts` | `features/budget/api/` mutation hooks                |
| `src/services/transaction.service.ts`          | `features/transactions/api/`                                 |
| `src/services/account.service.ts`              | `features/accounts/api/`                                     |
| `src/services/auth.service.ts`, `auth-errors.ts` | `features/auth/api/`; error mapping → `@/shared/errors`    |
| `src/services/user.service.ts`                 | `features/profile/api/`                                      |
| `src/services/achievement.service.ts`          | `features/gamification/api/`                                 |
| `src/services/xlsxImport.service.ts`           | `features/transactions/xlsx-import/api/`                     |
| `src/hooks/useBudget.ts`, `useBudgetItems.ts`, `useBudgetBalance.ts`, `useIncome.ts` | `features/budget/api/` queries + mutations |
| `src/hooks/useTransactions.ts`, `useTransactionSummary.ts` | `features/transactions/api/`                     |
| `src/hooks/useAccounts.ts`                     | `features/accounts/api/accountsQuery`                        |
| `src/hooks/useProfile.ts`                      | `features/profile/api/`                                      |
| `src/hooks/useDebouncedValue.ts`, `useMounted.ts` | `shared/hooks/` (`useMounted` likely deletable — RQ handles unmount) |
| `src/hooks/use-toast.ts`, `useSnackbar.ts`, `useTheme.ts` | `shared/hooks/` (consolidate toast/snackbar)       |
| `src/pages/main/<x>/components/*`              | `features/<domain>/components/`                              |
| `src/pages/main/<x>/use*.ts`, `validate.ts`, `types.ts` | `features/<domain>/hooks|model/`                    |
| `src/pages/main/<x>/index.tsx`                 | `src/pages/<x>/index.tsx` (thin)                             |
| `src/utils/budget-totals.ts`                   | `features/budget/model/`                                     |
| `src/utils/errors.ts` (`ApplicationError`, `getApiErrorMessage`, …) | `@/shared/errors` (`AppError`, `toUserMessage`, …) — delete helpers as imports go |
| `src/types/budget.ts`, `api.ts`                | generated models first; leftovers → `features/<d>/model/`    |
| `src/context/AuthContext.tsx`                  | `app/providers/AuthProvider` — session only; `user` + `accounts` become queries |
| `src/context/ThemeContext.tsx`                 | `app/providers/ThemeProvider`                                |
| `src/App.tsx` route table                      | `app/router.tsx` with `React.lazy` per page                  |

## Recipe — migrating one slice

Example: "budget income page".

1. **Query keys** — add any missing keys to `src/api/query-keys.ts`.
2. **Queries** — `features/budget/api/budgetQueries.ts`. Use the generated
   function if it exists; otherwise wrap the legacy service method with a
   `TODO(openapi)` comment.
3. **Mutations** — one `useXxx.ts` per operation. Pick `setQueryData` vs
   `invalidateQueries` from the response-shape table in data-flow.md.
4. **Move components** — `git mv` from `pages/main/budget/income/components`
   to `features/budget/components`. Replace `useIncome()` state with
   `useQuery(budgetIncomeQuery(...))` + mutation hooks. Delete the
   loading/error `useState`s and any manual `fetchBudgetById` after mutate.
   Failed sections render `<ErrorPanel>`; failed actions use `notifyError` /
   `applyFieldErrors`.
5. **Barrel** — export what the page needs from `features/budget/index.ts`.
6. **Thin the page** — page imports from `@/features/budget` only.
7. **Bridge legacy writers** — grep for remaining legacy hooks that mutate
   the same data; add `queryClient.invalidateQueries(...)` to their success
   path until they're migrated.
8. **Delete dead code** — if `useIncome` / `incomeService` has no remaining
   imports, delete it in this PR.
9. **Tests** — at least one behavior test per migrated mutation.
10. `npm run lint && npm run type-check && npm test`.

Keep each PR to one slice. Branch: `refactor/<domain>-<slice>-rq`.

## Bridging legacy and new during coexistence

`AuthContext.refreshAccounts()` is called after transaction mutations today.
Once accounts are a query, make it a shim:

```ts
const refreshAccounts = () =>
  queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
```

Then remove the call sites as their mutations move to hooks that invalidate
`accounts.all` themselves, and finally remove `refreshAccounts` and
`accounts` from the context.

## Suggested order

Lowest coupling first, highest-value second:

1. **Bootstrap** (Step 0).
2. **accounts** — read-only list, used everywhere; unlocks the
   `refreshAccounts` shim.
3. **budget detail + income/expense items** — biggest win: removes the
   manual-refetch workarounds documented in `useIncome.ts`.
4. **transactions** (+ summary) — invalidates accounts & budgets.
5. **profile, gamification**.
6. **auth** last — touches session handling; keep the mutator's 440 flow intact.
7. **app shell** — router to `app/`, lazy routes, delete `src/services`,
   domain hooks from `src/hooks`, and `src/pages/main`.

## Done criteria (per slice)

- No `useState` holding server data, no `useEffect` that fetches.
- No imports of `@/services/*` from the migrated files.
- Components import nothing from `@/api/generated`.
- Every mutation declares its cache effect.
- Errors go through `@/shared/errors` — no raw `error.message` in UI.
- Legacy file deleted or still has real consumers (listed in PR description).
