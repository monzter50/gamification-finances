# API contract sync

```
api-gamification-finances (backend)              gamification-finances (frontend)
───────────────────────────────────              ────────────────────────────────
route + @openapi JSDoc
   │ yarn export:schema
   ▼
openapi-schema.json (committed) ──yarn api:pull──▶ openapi/openapi.json  (committed copy)
                                                     openapi/source.json   (branch + commit it came from)
                                                        │ yarn api:gen
                                                        ▼
                                                     src/api/generated/*   (Orval → eslint → prettier)
                                                     src/api/ENDPOINTS.md  (endpoint index)
```

## Commands

| Command          | Does                                                                                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn api:pull`  | Copy backend spec → `openapi/openapi.json`. Source: `API_SPEC_SOURCE` (path/URL) → sibling checkout `../api-gamification-finances` → GitHub `@${API_SPEC_REF:-main}` |
| `yarn api:gen`   | Regenerate client + `ENDPOINTS.md` from the committed copy (offline, deterministic)                                                                                  |
| `yarn api:sync`  | `api:pull` + `api:gen` — the normal "backend changed" command                                                                                                        |
| `yarn api:check` | Regenerate and fail if `src/api` differs from git (CI, blocking)                                                                                                     |
| `yarn api:drift` | Fail if the committed copy differs from the backend source (CI, warning)                                                                                             |

`api:pull` warns when the sibling backend checkout isn't on `main` — you're
pulling an unreleased contract. That's fine on `development`; make sure the
backend change merges before the frontend one.

## CI (`.github/workflows/api-contract.yml`)

- **check** (blocking, on PRs touching the API): `yarn api:check`.
- **drift** (non-blocking): compares with the backend branch matching the PR
  base (`development` ↔ `development`, `main` ↔ `main`), plus a weekday cron.
  A warning means the backend moved: `yarn api:sync`, review the diff,
  adapt features.

## Reading a contract diff

After `api:sync`, `git diff openapi/openapi.json src/api/generated` tells
you what changed. Classify before coding:

| Change                                           | Kind                          | Frontend action                                                     |
| ------------------------------------------------ | ----------------------------- | ------------------------------------------------------------------- |
| New path / operation                             | additive                      | Adopt when needed                                                   |
| New optional field in response                   | additive                      | None required                                                       |
| New **required** field in request body           | breaking                      | Update every caller before deploy                                   |
| Field removed / renamed / type changed           | breaking                      | Fix callers; `yarn type-check` finds most                           |
| Enum value removed (e.g. income `"Credit Card"`) | breaking                      | Remove from selects, validators, fixtures                           |
| Unit change (float → cents) without type change  | breaking, **invisible to TS** | Must be called out in the spec description; grep usages manually    |
| New `errorCode`                                  | additive                      | Add to `src/shared/errors/error-codes.ts` (+ copy in `messages.ts`) |

Deploy order for breaking changes (expand → migrate → contract): backend
serves old + new → frontend migrates → backend removes old.

## Adding an endpoint the feature needs

1. Backend repo: implement route, add `@openapi` JSDoc (tag = domain,
   `operationId` optional — Orval names it `method + PascalPath` otherwise),
   `yarn export:schema`, commit.
2. Frontend: `yarn api:sync`. Confirm it appears in `ENDPOINTS.md` with a
   generated function (⚠️ means the name didn't match — check `operationId`).
3. Add the `queryOptions` / mutation hook in `features/<domain>/api/`.

## Known gaps

The backend spec documents ~18 of ~40 routes. Undocumented today: accounts,
users, most of transactions (list, summary, CRUD), budgets list/create/get.
Those go through feature-local legacy fetchers
(`features/<domain>/api/*Fetchers.ts` on `@/api/legacy-client`) marked
`TODO(openapi)` — document them in the backend when you touch them.
