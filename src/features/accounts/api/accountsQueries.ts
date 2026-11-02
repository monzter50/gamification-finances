import { queryOptions, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { fetchAccounts } from "@/features/accounts/api/accountFetchers";

/**
 * All accounts of the signed-in user. Balances move with every transaction —
 * invalidate via `invalidateFor(qc, "transaction" | "account")`, never refetch by hand.
 */
export const accountsListQuery = () =>
  queryOptions({
    queryKey: queryKeys.accounts.list(),
    queryFn: fetchAccounts, // TODO(openapi): legacy fetcher
  });

export const useAccountsList = () => useQuery(accountsListQuery());
