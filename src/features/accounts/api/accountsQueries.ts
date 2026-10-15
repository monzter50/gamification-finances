import { queryOptions, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { accountService } from "@/services/account.service";
import type { Account } from "@/types/api";

/**
 * All accounts of the signed-in user. Balances move with every transaction —
 * invalidate via `invalidateFor(qc, "transaction" | "account")`, never refetch by hand.
 */
export const accountsListQuery = () =>
  queryOptions({
    queryKey: queryKeys.accounts.list(),
    // TODO(openapi): GET /accounts missing from spec — legacy fetcher
    queryFn: async (): Promise<Account[]> => (await accountService.getAll()).data ?? [],
  });

export const useAccountsList = () => useQuery(accountsListQuery());
