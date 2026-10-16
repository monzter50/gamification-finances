import { BentoGrid, BentoItem } from "@/components/ui";
import { useSessionUser } from "@/features/auth";
import { useProfile, useUserStats } from "@/features/profile/api/profileQueries";
import { LevelProgressCard } from "@/features/profile/components/LevelProgressCard";
import { LifetimeTotals } from "@/features/profile/components/LifetimeTotals";
import { SavingsGoalCard } from "@/features/profile/components/SavingsGoalCard";
import { deriveProgress } from "@/features/profile/model/progress";
import { ErrorPanel } from "@/shared/errors";

/** Gamification + savings summary. Stats are optional (see fetchUserStats). */
export const ProfileOverview = () => {
  const profile = useProfile();
  const stats = useUserStats();
  // `/auth/me` is the only source of XP-to-next-level and achievement counts.
  const { data: user } = useSessionUser();

  if (profile.isError) {
    return (
      <ErrorPanel
        error={profile.error}
        title="Couldn't load your profile"
        onRetry={() => void profile.refetch()}
      />
    );
  }

  const loading = profile.isPending || stats.isPending;
  const progress = deriveProgress(profile.data, stats.data, user);

  return (
    <>
      <BentoGrid>
        <BentoItem span={8}>
          <LevelProgressCard progress={progress} loading={loading} />
        </BentoItem>
        <BentoItem span={4}>
          <SavingsGoalCard progress={progress} loading={loading} />
        </BentoItem>
      </BentoGrid>
      <LifetimeTotals progress={progress} loading={loading} />
    </>
  );
};
