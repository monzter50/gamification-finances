import type { QueryClient, QueryKey } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";

/**
 * What becomes stale when an entity changes — the single source of truth for
 * cross-feature cache sync. Features don't know about each other; they call
 * `invalidateFor(qc, "transaction")` and every dependent view refetches.
 *
 * When the backend adds a side effect (e.g. transactions unlock achievements),
 * change one line here.
 */
const AFFECTS = {
  // Balance, budget totals, XP/streak and the user's stats all move with a transaction.
  transaction: [
    queryKeys.transactions.all,
    queryKeys.accounts.all,
    queryKeys.budgets.all,
    queryKeys.gamification.all,
    queryKeys.user.all,
  ],
  budget: [queryKeys.budgets.all],
  budgetItem: [queryKeys.budgets.all],
  account: [queryKeys.accounts.all, queryKeys.transactions.all],
  profile: [queryKeys.user.all],
} as const satisfies Record<string, readonly QueryKey[]>;

export type InvalidationEntity = keyof typeof AFFECTS;

/**
 * Return this from `onSuccess` so the mutation stays pending until the
 * refetches land — no flash of stale totals.
 */
export const invalidateFor = (qc: QueryClient, entity: InvalidationEntity) =>
  Promise.all(AFFECTS[entity].map((queryKey) => qc.invalidateQueries({ queryKey })));
