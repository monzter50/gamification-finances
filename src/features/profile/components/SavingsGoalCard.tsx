import { Target } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Money,
  Progress,
  Skeleton,
} from "@/components/ui";
import type { ProfileProgress } from "@/features/profile/model/progress";

const CURRENCY = "MXN";

export interface SavingsGoalCardProps {
  progress: ProfileProgress;
  loading: boolean;
}

// TODO(i18n)
export const SavingsGoalCard = ({ progress: p, loading }: SavingsGoalCardProps) => (
  <Card className="h-full">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2">
        <Target aria-hidden="true" className="h-5 w-5 text-savings" />
        Savings Goal
      </CardTitle>
      <CardDescription>
        {p.goalReached ? "Goal reached — nice work." : "Progress toward your target."}
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {loading ? (
        <Skeleton className="h-2 w-full" />
      ) : p.savingsGoal > 0 ? (
        <>
          <Progress
            value={p.savingsProgress}
            aria-label="Savings goal progress"
            className={p.goalReached ? "bg-success/20" : undefined}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <Money value={p.totalSavings} currency={CURRENCY} size="sm" />
            <Money value={p.savingsGoal} currency={CURRENCY} size="sm" />
          </div>
          <div className="text-xs text-muted-foreground">
            {Math.round(p.savingsProgress)}% complete
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Set a savings goal below to start tracking progress.
        </p>
      )}
    </CardContent>
  </Card>
);
