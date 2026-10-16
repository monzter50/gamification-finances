# Target folder structure

```
src/
  app/                          # App shell — wired once, rarely touched
    App.tsx                     # providers + RouterProvider
    router.tsx                  # route table, React.lazy per page
    query-client.ts             # QueryClient + global MutationCache onError
    providers/
      ThemeProvider.tsx
      AuthProvider.tsx          # session token only — profile comes from a query

  pages/                        # Route shells. Default export. ~50 lines max.
    dashboard/index.tsx
    budget/index.tsx
    budget/detail/index.tsx
    budget/income/index.tsx
    transactions/index.tsx
    transactions/import-xlsx/index.tsx

  features/
    budget/
      api/
        budgetQueries.ts        # budgetListQuery, budgetDetailQuery (queryOptions)
        useAddIncomeItem.ts     # one mutation hook per file
        useUpdateIncomeItems.ts
      components/
        IncomeTable.tsx
        IncomeTable.test.tsx
        BudgetItemDraftRow.tsx
      hooks/
        useBudgetItemFilters.ts # composes URL params + query
      store/
        budgetUiStore.ts        # e.g. expanded rows, draft row open — never server data
      model/
        budget-totals.ts        # pure: normalizeBudget, totals
        budget.types.ts         # domain types not covered by generated models
      index.ts                  # PUBLIC API — the only importable entry

    transactions/
      api/ components/ hooks/ model/
      xlsx-import/              # sub-feature: same shape, exported via ../index.ts
      index.ts

    accounts/  auth/  profile/  gamification/

  shared/
    components/                 # domain-free composites (not design-system primitives)
    errors/                     # AppError, normalizeError, toUserMessage, notifyError, ErrorPanel
    hooks/                      # useDebouncedValue
    utils/                      # pure helpers

  components/ui/                # Design system — stays here (design-system.md contract)
  api/
    generated/                  # Orval output — never edit, never import from components
    orval-mutator.ts            # transport: auth, error body → AppError, 440 handling
    query-keys.ts               # single query-key registry
    unwrap.ts                   # generated response → payload
  config/                       # env, logger, api-client, session
```

## The barrel is the contract

```ts
// src/features/budget/index.ts
export { budgetDetailQuery, budgetListQuery } from "./api/budgetQueries";
export { useAddIncomeItem } from "./api/useAddIncomeItem";
export { IncomeTable } from "./components/IncomeTable";
export type { BudgetSummary } from "./model/budget.types";
// NOT exported: internal rows, store internals, model helpers only budget uses
```

Pages and other features import `@/features/budget` — never
`@/features/budget/components/...`. If something outside needs an internal,
export it deliberately (that's a design decision, so it's visible in review).

## Allowed imports

| From ↓ / may import →      | app | pages    | features (barrel)             | features (own internals) | shared, components/ui, api, config |
| -------------------------- | --- | -------- | ----------------------------- | ------------------------ | ---------------------------------- |
| `app/`                     | ✓   | ✓ (lazy) | ✓                             | ✗                        | ✓                                  |
| `pages/`                   | ✗   | ✗        | ✓                             | ✗                        | ✓                                  |
| `features/X`               | ✗   | ✗        | ✓ (other features, sparingly) | ✓ (X only)               | ✓                                  |
| `shared/`, `components/ui` | ✗   | ✗        | ✗                             | ✗                        | ✓ (downward only)                  |

`components/` inside a feature may not import `@/api/generated` — go through
the feature's `api/`.

### Optional enforcement

`eslint-plugin-import` is already installed. When you want lint to enforce
this, add `import/no-restricted-paths` zones:

```js
"import/no-restricted-paths": ["warn", { zones: [
  { target: "./src/shared",          from: "./src/features" },
  { target: "./src/components/ui",   from: "./src/features" },
  { target: "./src/features",        from: "./src/pages" },
  { target: "./src/features/*/components", from: "./src/api/generated" },
  { target: "./src/features/*/components", from: "./src/services" },
]}]
```

## Pages stay thin

```tsx
// src/pages/budget/income/index.tsx
import { useParams } from "react-router";

import { PageHeader } from "@/components/ui";
import { IncomeTable } from "@/features/budget";

const BudgetIncomePage = () => {
  const { id = "" } = useParams();
  return (
    <>
      <PageHeader title={t("budget.income.title")} />
      <IncomeTable budgetId={id} />
    </>
  );
};

export default BudgetIncomePage;
```

A page reads route params, picks a layout, composes features. If a page
file grows a `useState` for data or a `components/` folder with logic, that
logic belongs in a feature.
