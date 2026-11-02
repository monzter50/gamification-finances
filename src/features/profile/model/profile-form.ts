import type { UpdateProfileRequest, UserProfileData } from "@/types/api";

/**
 * Only what actually changed, or `null` when nothing did (skip the request).
 * Blank names are ignored; the form validates them before we get here.
 */
export const toProfileChanges = (
  profile: Pick<UserProfileData, "name" | "savingsGoal">,
  values: { name: string; savingsGoal: string },
): UpdateProfileRequest | null => {
  const changes: UpdateProfileRequest = {};
  const name = values.name.trim();
  if (name && name !== profile.name) changes.name = name;

  const goal = Number(values.savingsGoal);
  if (values.savingsGoal.trim() !== "" && !Number.isNaN(goal) && goal !== profile.savingsGoal) {
    changes.savingsGoal = goal;
  }
  return Object.keys(changes).length > 0 ? changes : null;
};
