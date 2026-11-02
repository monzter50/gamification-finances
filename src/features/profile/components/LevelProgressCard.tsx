import { Award, Calendar, Coins, Flame, Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  LevelBadge,
  Skeleton,
  XPProgressBar,
} from "@/components/ui";
import { StatCell } from "@/features/profile/components/StatCell";
import type { ProfileProgress } from "@/features/profile/model/progress";

export interface LevelProgressCardProps {
  progress: ProfileProgress;
  loading: boolean;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// TODO(i18n)
/** Level, XP toward the next level, coins, and the streak/achievement cells. */
export const LevelProgressCard = ({ progress: p, loading }: LevelProgressCardProps) => (
  <Card className="h-full">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <LevelBadge level={p.level} size="lg" />
          <CardDescription>
            {loading
              ? "Loading your progress…"
              : p.xpToNextLevel > 0
                ? `${p.xpToNextLevel.toLocaleString()} XP to level ${p.level + 1}`
                : "Max level reached"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-xp/15 px-3 py-1 text-xp">
          <Coins aria-hidden="true" className="h-4 w-4" />
          <span className="text-sm font-semibold tabular-nums">
            <span className="sr-only">Coins: </span>
            {p.coins.toLocaleString()}
          </span>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      {loading ? (
        <Skeleton className="h-2 w-full" />
      ) : (
        <XPProgressBar
          current={p.experience}
          max={p.experience + p.xpToNextLevel}
          level={p.level}
        />
      )}

      <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
        <StatCell
          icon={Flame}
          label="Streak"
          value={p.streak === null ? "—" : plural(p.streak, "day")}
          tone="streak"
        />
        <StatCell icon={Sparkles} label="Achievements" value={p.achievements} tone="level" />
        <StatCell icon={Award} label="Badges" value={p.badges} tone="info" />
        <StatCell
          icon={Calendar}
          label="Member for"
          value={p.daysSinceRegistration === null ? "—" : `${p.daysSinceRegistration}d`}
          tone="success"
        />
      </div>
    </CardContent>
  </Card>
);
