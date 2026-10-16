import { queryOptions, useQuery } from "@tanstack/react-query";

import {
  getApiAuthMe,
  postApiAuthLogin,
  postApiAuthLogout,
} from "@/api/generated/authentication/authentication";
import type { LoginRequest } from "@/api/generated/models";
import { queryKeys } from "@/api/query-keys";
import { unwrap } from "@/api/unwrap";
import type { UserProfile } from "@/types/api";

/** POST /auth/login. The mutator throws an AppError (with status) on failure. */
export const loginRequest = async (credentials: LoginRequest) => {
  const { token, expiresIn } = await unwrap(postApiAuthLogin(credentials));
  return { token, expiresIn };
};

/** POST /auth/logout — blacklists the token server-side. */
export const logoutRequest = async (): Promise<void> => {
  await unwrap(postApiAuthLogout());
};

/**
 * The signed-in user. Fetching it also verifies the stored token, so the
 * AuthProvider uses it as the session check. Moves with transactions (XP,
 * coins) — covered by `invalidateFor(qc, "transaction" | "profile")`.
 */
export const sessionUserQuery = () =>
  queryOptions({
    queryKey: queryKeys.user.me(),
    queryFn: async (): Promise<UserProfile> => {
      const body = await unwrap(getApiAuthMe());
      // TODO(spec): the spec's UserProfile lacks the gamification fields
      // (level, experience, coins, …) that the backend returns — drop the cast
      // once the schema declares them.
      return body as unknown as UserProfile;
    },
  });

export const useSessionUser = () => useQuery(sessionUserQuery());
