import { ApiError } from "@aglaya/api-core";
import { logger } from "@aglaya/logger";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/user.service";
import type {
  UpdateProfileRequest,
  UserProfileData,
  UserStats,
} from "@/types/api";

import { useSnackbar } from "./useSnackbar";

interface UseProfileReturn {
  profile: UserProfileData | null;
  stats: UserStats | null;
  isLoadingProfile: boolean;
  isLoadingStats: boolean;
  isMutating: boolean;
  refreshProfile: () => Promise<void>;
  refreshStats: () => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  updateProfile: (data: UpdateProfileRequest) => Promise<UserProfileData | null>;
}

interface UseProfileOptions {
  /** Auto-fetch profile + stats on mount. Defaults to true. */
  autoFetch?: boolean;
}

/**
 * Profile + user-stats hook.
 *
 * Reads from `/users/profile` and `/users/stats`, writes via PUT
 * `/users/profile`. After a successful mutation it also calls
 * `AuthContext.fetchUserProfile()` so globally-consumed values (user.name,
 * level, coins) stay in sync — every consumer of `useAuth()` sees the change
 * immediately without a full page refresh.
 *
 * ⚠️ Not a React Query cache. Stats/profile re-fetch each mount; for a page
 * used this rarely that's fine. Migrate to TanStack Query if the profile
 * screen ever shares these resources with the dashboard.
 */
export function useProfile(options: UseProfileOptions = {}): UseProfileReturn {
  const { autoFetch = true } = options;
  const { fetchUserProfile } = useAuth();
  const snackbar = useSnackbar();

  const [ profile, setProfile ] = useState<UserProfileData | null>(null);
  const [ stats, setStats ] = useState<UserStats | null>(null);
  const [ isLoadingProfile, setIsLoadingProfile ] = useState(false);
  const [ isLoadingStats, setIsLoadingStats ] = useState(false);
  const [ isMutating, setIsMutating ] = useState(false);

  const hasFetched = useRef(false);

  const refreshProfile = useCallback(async () => {
    setIsLoadingProfile(true);
    try {
      const res = await userService.getProfile();
      setProfile(res.data ?? null);
    } catch (error) {
      logger.error("Failed to fetch profile", error);
      snackbar.error({
        title: "Failed to load profile",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsLoadingProfile(false);
    }
  }, [ snackbar ]);

  const refreshStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const res = await userService.getStats();
      setStats(res.data ?? null);
    } catch (error) {
      // `/users/stats` is documented but may not yet be wired up on the
      // backend router (see api-gamification-finances/src/routes/users.ts).
      // Swallow 404 silently — the profile page derives fallback values
      // from `/users/profile` + AuthContext.user so the UI still renders.
      const is404 = error instanceof ApiError && error.status === 404;
      if (is404) {
        logger.debug("/users/stats not available (404) — using profile fallbacks");
        setStats(null);
      } else {
        logger.error("Failed to fetch stats", error);
        snackbar.error({
          title: "Failed to load stats",
          description: error instanceof Error ? error.message : "An error occurred",
        });
      }
    } finally {
      setIsLoadingStats(false);
    }
  }, [ snackbar ]);

  const updateProfile = useCallback(
    async (data: UpdateProfileRequest): Promise<UserProfileData | null> => {
      setIsMutating(true);
      try {
        logger.debug("Updating profile", data);
        const res = await userService.updateProfile(data);
        const next = res.data ?? null;
        setProfile(next);

        // Keep AuthContext in sync so the sidebar/header reflect the new
        // name/level immediately.
        await fetchUserProfile();

        snackbar.success({
          title: "Profile updated",
          description: "Your profile has been saved.",
        });
        return next;
      } catch (error) {
        logger.error("Failed to update profile", error);
        snackbar.error({
          title: "Failed to update profile",
          description: error instanceof Error ? error.message : "An error occurred",
        });
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [ fetchUserProfile, snackbar ]
  );

  useEffect(() => {
    if (!autoFetch || hasFetched.current) { return; }
    hasFetched.current = true;
    refreshProfile();
    refreshStats();
  }, [ autoFetch, refreshProfile, refreshStats ]);

  return {
    profile,
    stats,
    isLoadingProfile,
    isLoadingStats,
    isMutating,
    refreshProfile,
    refreshStats,
    updateProfile,
  };
}
