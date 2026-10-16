import { expectStatus, legacyAuth } from "@/api/legacy-client";
import { apiClient } from "@/config/api-client";
import { normalizeError } from "@/shared/errors";
import type { ApiResponse, UpdateProfileRequest, UserProfileData, UserStats } from "@/types/api";

/*
 * Legacy fetchers: /users/* isn't in the OpenAPI spec yet. Moved from
 * src/services/user.service.ts; delete each when its route lands in the spec.
 */

// TODO(openapi): GET /users/profile missing from spec
export const fetchProfile = async (): Promise<UserProfileData> => {
  const result = await apiClient.get<ApiResponse<UserProfileData>>("/users/profile", legacyAuth());
  return expectStatus(result, 200).data;
};

// TODO(openapi): PUT /users/profile missing from spec
export const updateProfile = async (dto: UpdateProfileRequest): Promise<UserProfileData> => {
  const result = await apiClient.put<ApiResponse<UserProfileData>>("/users/profile", {
    body: { ...dto },
    ...legacyAuth(),
  });
  return expectStatus(result, 200).data;
};

/**
 * Streak, transaction count, days since sign-up, achievement counts.
 * Returns `null` while the backend doesn't serve it — the page then derives
 * what it can from the profile.
 */
// TODO(backend): GET /users/stats is documented but has no route yet (404).
export const fetchUserStats = async (): Promise<UserStats | null> => {
  try {
    const result = await apiClient.get<ApiResponse<UserStats>>("/users/stats", legacyAuth());
    return expectStatus(result, 200).data;
  } catch (err) {
    if (normalizeError(err).status === 404) return null;
    throw err;
  }
};
