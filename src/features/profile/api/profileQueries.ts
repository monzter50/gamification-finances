import { queryOptions, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { fetchProfile, fetchUserStats } from "@/features/profile/api/profileFetchers";

/*
 * Profile and stats move with every transaction (XP, coins, savings) —
 * `invalidateFor(qc, "transaction" | "profile")` refreshes both.
 */

export const profileQuery = () =>
  queryOptions({ queryKey: queryKeys.user.profile(), queryFn: fetchProfile });

export const userStatsQuery = () =>
  queryOptions({
    queryKey: queryKeys.user.stats(),
    queryFn: fetchUserStats,
    // A missing route won't appear mid-session; don't ask again on every visit.
    staleTime: 5 * 60_000,
  });

export const useProfile = () => useQuery(profileQuery());

export const useUserStats = () => useQuery(userStatsQuery());
