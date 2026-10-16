import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { updateProfile } from "@/features/profile/api/profileFetchers";
import { useSnackbar } from "@/hooks";
import type { UpdateProfileRequest } from "@/types/api";

/**
 * PUT /users/profile returns the full profile, so it goes straight into the
 * cache — every reader (profile page, dashboard greeting) updates without a
 * refetch. Stats are invalidated because the savings goal feeds them.
 *
 * Deliberately does NOT call AuthContext.fetchUserProfile(): that flips the
 * global auth `loading` flag, which made ProtectedRoutes replace the whole
 * app with a spinner (and log out if /auth/me failed).
 */
export const useUpdateProfile = () => {
  const qc = useQueryClient();
  const snackbar = useSnackbar();

  return useMutation({
    mutationFn: (dto: UpdateProfileRequest) => updateProfile(dto),
    meta: { errorTitle: "Couldn't update profile" },
    onSuccess: (profile) => {
      qc.setQueryData(queryKeys.user.profile(), profile);
      snackbar.success({ title: "Profile updated", description: "Your profile has been saved." });
      return qc.invalidateQueries({ queryKey: queryKeys.user.stats() });
    },
  });
};
