---
name: frontend-architecture
description: Use this skill whenever you add, move, or refactor non-trivial frontend code in this repo — a new feature, page, data hook, API call, mutation, store, or context; deciding where a file goes; wiring how components get server data or share state; or touching anything in the legacy src/services, src/hooks, or src/pages/*/components folders. Defines the target architecture (feature-sliced + React Query + Zustand + Orval) and the incremental migration rules from the current layered code.
---

# Frontend Architecture Skill

This repo is **mid-migration**. The code you'll find is layered
(`src/services` → `src/hooks` → `src/pages`). The target is feature-sliced
with React Query for server state. **New code follows the target. Old code
moves when you touch it** — never big-bang, never extend the legacy layers.

For UI (colors, Money, Stat, layout) use the `design-system` skill — this one
covers structure, data flow, and communication only.

## The target in one picture

```
pages/            thin route shells: read URL params, compose features
  │
  ▼
features/<domain>/   public API = index.ts barrel (nothing else is importable)
  ├─ api/            queryOptions factories + mutation hooks (React Query)
  ├─ components/     domain UI
  ├─ hooks/          domain logic hooks (compose api/ + store/)
  ├─ store/          Zustand slice — CLIENT state only (optional)
  └─ model/          types, pure functions, validators
  │
  ▼
shared/  components/ui (design system)  api/ (generated + queryKeys)  config/
```

**Imports only flow downward.** A layer never imports from a layer above it.

## Before writing code, answer these

1. **Is this server data?** → React Query, via a `queryOptions` factory in
   `features/<domain>/api/`. Never `useState` + `useEffect` + fetch. Never
   copy server data into Zustand or context.
2. **Is it UI state shared across distant components?** → Zustand slice in
   `features/<domain>/store/`. If it should survive reload/share → URL search
   params instead.
3. **Is it local to one component tree?** → `useState`/`useReducer`.
   Prop-drill max 2 levels, then lift to the feature store.
4. **Is it a cross-cutting dependency (theme, session)?** → Context, in
   `src/app/providers/`. Nothing domain-specific goes in context.
5. **Does it need another feature?** → Import that feature's barrel
   (`@/features/accounts`), never its internals. If two features need each
   other, the shared piece moves to `shared/` or the composition moves up to
   the page.
6. **After a mutation, what's stale?** → Invalidate by `queryKeys` (see
   below). Transactions change account balances and budget totals — always
   invalidate all three.

## Where does it go?

| You're writing…                                  | Put it in                                         |
| ------------------------------------------------ | ------------------------------------------------- |
| A route                                          | `src/pages/<route>/index.tsx` (default export)    |
| Data fetch / mutation for a domain               | `src/features/<domain>/api/`                      |
| Component used by one domain                     | `src/features/<domain>/components/`               |
| Component used by 2+ domains, no domain logic    | `src/shared/components/`                          |
| Design-system primitive (Money, Stat, Button…)   | `src/components/ui/` (see design-system skill)    |
| Pure calc (totals, normalization, validation)    | `src/features/<domain>/model/`                    |
| Generic hook (`useDebouncedValue`, `useMounted`) | `src/shared/hooks/`                               |
| Query key                                        | `src/api/query-keys.ts` — the single registry     |
| API transport, auth header, error mapping        | `src/api/orval-mutator.ts` (don't bypass it)      |
| Error types, copy, toasts, reporting, boundaries | `src/shared/errors/` — see data-flow.md "Errors"  |
| QueryClient, router, providers                   | `src/app/`                                        |

Domains: `auth`, `accounts`, `budget` (incl. income/expense items),
`transactions` (incl. xlsx-import), `profile`, `gamification`.
`dashboard` is a **page** that composes features — not a feature.

## API contract — check it before building

The backend's OpenAPI spec is the only source of truth for endpoints and
shapes. It's copied into `openapi/openapi.json` (committed) and the client is
generated from that copy.

1. **Sync:** `npm run api:sync` (pull backend spec → regenerate client →
   rewrite `src/api/ENDPOINTS.md`). Read the git diff — that's what changed.
2. **Discover:** read `src/api/ENDPOINTS.md`. One line per endpoint: method,
   path, generated function, body, success shape.
3. **Endpoint exists** → use the generated function inside
   `features/<domain>/api/`. Read the model's JSDoc for response shape.
4. **Endpoint missing** → **stop**. Don't hand-write a `fetch` or infer
   types from backend source. It's a backend task: add the route's `@openapi`
   doc in `../api-gamification-finances`, `yarn export:schema`, commit, then
   `npm run api:sync` here. If the user can't change the backend now, wrap the
   legacy `src/services` method with `// TODO(openapi): <METHOD path>`.
5. **Never edit** `src/api/generated/` or `openapi/` by hand — CI
   (`npm run api:check`) fails if generated code doesn't match the contract.

Details, CI, and breaking-change handling: `references/contract.md`.

## Server state — the one pattern

```ts
// src/features/budget/api/budgetQueries.ts
export const budgetDetailQuery = (id: string) =>
  queryOptions({
    queryKey: queryKeys.budgets.detail(id),
    queryFn: () => budgetService.getBudgetById(id), // legacy fetcher until in OpenAPI
    select: normalizeBudget,
  });

// component
const { data: budget, isPending } = useQuery(budgetDetailQuery(id));
```

```ts
// src/features/budget/api/useAddIncomeItem.ts
export const useAddIncomeItem = (budgetId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: AddIncomeItemRequest) =>
      unwrap(postApiBudgetsIdIncome(budgetId, item)),
    // POST returns only the item + totals, not the budget → invalidate
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.budgets.detail(budgetId) }),
  });
};
```

Mutation cache rule — the backend is NOT uniform:
- Returns the **full aggregate** (PATCH `/income`, PATCH `/expense`) →
  `qc.setQueryData(key, response)`.
- Returns **only the touched item** (POST, PUT, DELETE on items) →
  `invalidateQueries`. Never `setQueryData` a partial over the parent.

Full details, query-key registry, and error handling:
`references/data-flow.md`.

## Communication rules

- **Page → feature:** props for identity (`budgetId` from `useParams`),
  nothing else. Features fetch their own data by key.
- **Feature → feature:** through the **query cache** (shared keys), the
  **URL**, or a barrel-exported store selector. Never by passing server data
  through props across feature boundaries.
- **Component → server:** always `component → feature api/ hook →
  generated client → mutator`. Components never import from `@/api/generated`
  or `@/services` directly.
- **Side-channel events** (session revoked) stay as the existing pub/sub in
  `src/config/session-revocation.ts`. Don't add more global event buses.

## Migration rules (legacy → target)

1. **Never add to** `src/services/`, domain hooks in `src/hooks/`, or logic
   files in `src/pages/**`. If a change needs one of these, migrate that
   slice first (or in the same PR).
2. **Migrate by slice, not by layer:** one domain operation at a time
   (e.g. "budget detail read" or "add income item"), moving its hook,
   fetcher, types, and components together.
3. **Keep legacy and new consistent:** while a legacy hook still mutates
   data that a migrated query reads, the legacy hook must call
   `queryClient.invalidateQueries(...)` after it succeeds.
4. **Delete when empty:** a legacy hook/service is deleted in the PR that
   removes its last import. No `@deprecated` zombies.
5. **Prefer the generated client.** If the endpoint isn't in
   `src/api/generated/`, wrap the legacy service method as the `queryFn` and
   add `// TODO(openapi): <METHOD path> missing from spec`.

Step-by-step recipes, the legacy→target file map, and what the bootstrap
already provides (`queryClient`, `queryKeys`, `invalidateFor`, `unwrap`):
`references/migration.md`.
Folder layout with examples: `references/structure.md`.

## Red flags — stop and restructure

- `useEffect(() => { fetchX().then(setX) }, [])` in new code
- `import … from "@/services/…"` in a component
- `import … from "@/features/other/components/…"` (deep cross-feature import)
- Server data in a Zustand store or context value
- A manual `refetch()` / `refreshAccounts()` after a mutation instead of
  key invalidation
- A query key written inline as an array literal instead of `queryKeys.*`
