import type { UserProfile, UserProfileData, UserStats } from "@/types/api";

export interface ProfileProgress {
  level: number;
  experience: number;
  xpToNextLevel: number;
  coins: number;
  totalSavings: number;
  totalExpenses: number;
  savingsGoal: number;
  /** 0–100 */
  savingsProgress: number;
  goalReached: boolean;
  achievements: number;
  badges: number;
  /** Only `/users/stats` knows these — `null` until the backend serves it. */
  streak: number | null;
  totalTransactions: number | null;
  daysSinceRegistration: number | null;
}

/**
 * One view of the user's progress from up to three partial sources, most
 * specific first: `/users/stats` → `/users/profile` → the session user
 * (`/auth/me`, the only source of XP-to-next-level and achievement lists).
 */
export const deriveProgress = (
  profile: UserProfileData | null | undefined,
  stats: UserStats | null | undefined,
  sessionUser: UserProfile | null | undefined,
): ProfileProgress => {
  const totalSavings =
    stats?.totalSavings ?? profile?.totalSavings ?? sessionUser?.totalSavings ?? 0;
  const savingsGoal = stats?.savingsGoal ?? profile?.savingsGoal ?? sessionUser?.savingsGoal ?? 0;
  const computedProgress = savingsGoal > 0 ? Math.min((totalSavings / savingsGoal) * 100, 100) : 0;

  return {
    level: stats?.level ?? profile?.level ?? sessionUser?.level ?? 0,
    experience: stats?.experience ?? profile?.experience ?? sessionUser?.experience ?? 0,
    xpToNextLevel: stats?.experienceToNextLevel ?? sessionUser?.experienceToNextLevel ?? 0,
    coins: stats?.coins ?? profile?.coins ?? sessionUser?.coins ?? 0,
    totalSavings,
    totalExpenses:
      stats?.totalExpenses ?? profile?.totalExpenses ?? sessionUser?.totalExpenses ?? 0,
    savingsGoal,
    savingsProgress: Math.min(stats?.savingsProgress ?? computedProgress, 100),
    goalReached: stats?.savingsGoalReached ?? (savingsGoal > 0 && totalSavings >= savingsGoal),
    achievements: stats?.totalAchievements ?? sessionUser?.achievements?.length ?? 0,
    badges: stats?.totalBadges ?? sessionUser?.badges?.length ?? 0,
    streak: stats?.currentStreak ?? null,
    totalTransactions: stats?.totalTransactions ?? null,
    daysSinceRegistration: stats?.daysSinceRegistration ?? null,
  };
};
