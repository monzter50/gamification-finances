"use client";

import {
  Award,
  Calendar,
  Coins,
  Flame,
  Loader2,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  BentoGrid,
  BentoItem,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  LevelBadge,
  Money,
  PageHeader,
  Progress,
  Skeleton,
  XPProgressBar,
} from "@/components/ui";
import {
  ThemeSelector,
  ThemeToggle,
  ThemeToggleWithText,
} from "@/components/ui/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

interface ProfileFormValues {
  name: string;
  savingsGoal: string;
}

const DEFAULT_CURRENCY = "MXN";

// Tone palette for the small stat cells. Maps semantically to design tokens
// so a Flame icon is always "streak", not "orange-500".
type CellTone = "streak" | "level" | "info" | "success" | "expense" | "savings" | "xp";

const cellToneClass: Record<CellTone, string> = {
  streak:  "text-streak",
  level:   "text-level",
  info:    "text-info",
  success: "text-success",
  expense: "text-expense",
  savings: "text-savings",
  xp:      "text-xp",
};

function StatCell({
  icon: Icon,
  label,
  value,
  tone,
}: {
  // eslint-disable-next-line no-unused-vars
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  tone?: CellTone;
}) {
  const toneClass = tone ? cellToneClass[tone] : "text-foreground";
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-background">
        <Icon className={cn("h-4 w-4", toneClass)} />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn("text-sm font-semibold", toneClass)}>{value}</span>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const {
    profile,
    stats,
    isLoadingProfile,
    isLoadingStats,
    isMutating,
    updateProfile,
  } = useProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = useForm<ProfileFormValues>({
    defaultValues: { name: "",
      savingsGoal: "" },
  });

  // Reset the form whenever the server payload lands so the inputs reflect
  // canonical state (and `isDirty` stays meaningful).
  useEffect(() => {
    if (!profile) { return; }
    reset({
      name: profile.name ?? "",
      savingsGoal: profile.savingsGoal != null ? String(profile.savingsGoal) : "0",
    });
  }, [ profile, reset ]);

  const onSubmit = async (values: ProfileFormValues) => {
    const payload: { name?: string; savingsGoal?: number } = {};
    if (values.name.trim() && values.name.trim() !== profile?.name) {
      payload.name = values.name.trim();
    }
    const parsedGoal = Number(values.savingsGoal);
    if (!Number.isNaN(parsedGoal) && parsedGoal !== profile?.savingsGoal) {
      payload.savingsGoal = parsedGoal;
    }
    if (Object.keys(payload).length === 0) { return; }
    await updateProfile(payload);
  };

  const displayName = profile?.name ?? user?.name ?? "";
  const email = profile?.email ?? user?.email ?? "";

  // --- Gamification derived values ---
  const level = stats?.level ?? profile?.level ?? user?.level ?? 0;
  const experience = stats?.experience ?? profile?.experience ?? user?.experience ?? 0;
  const xpToNext = stats?.experienceToNextLevel ?? user?.experienceToNextLevel ?? 0;
  const coins = stats?.coins ?? profile?.coins ?? user?.coins ?? 0;

  const totalSavings = stats?.totalSavings ?? profile?.totalSavings ?? user?.totalSavings ?? 0;
  const savingsGoal = stats?.savingsGoal ?? profile?.savingsGoal ?? user?.savingsGoal ?? 0;

  const computedSavingsProgress =
    savingsGoal > 0 ? Math.min((totalSavings / savingsGoal) * 100, 100) : 0;
  const savingsProgress = stats?.savingsProgress ?? computedSavingsProgress;
  const goalReached = stats?.savingsGoalReached ?? (savingsGoal > 0 && totalSavings >= savingsGoal);

  const achievementsCount = stats?.totalAchievements ?? user?.achievements?.length ?? 0;
  const badgesCount = stats?.totalBadges ?? user?.badges?.length ?? 0;

  const hasStats = stats != null;
  const streak = stats?.currentStreak ?? 0;
  const totalTransactions = stats?.totalTransactions ?? 0;
  const daysSinceRegistration = stats?.daysSinceRegistration ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your Profile"
        description="Level up, track your streak, and manage your savings goal."
      />

      {/* Gamification summary */}
      <BentoGrid>
        {/* Level & XP */}
        <BentoItem span={8}>
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <LevelBadge level={level} size="lg" />
                <CardDescription>
                  {isLoadingStats
                    ? "Loading your progress…"
                    : xpToNext > 0
                      ? `${xpToNext.toLocaleString()} XP to level ${level + 1}`
                      : "Max level reached"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-xp/15 px-3 py-1 text-xp">
                <Coins className="h-4 w-4" />
                <span className="text-sm font-semibold tabular-nums">
                  {coins.toLocaleString()}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingStats ? (
              <Skeleton className="h-2 w-full" />
            ) : (
              <XPProgressBar
                current={experience}
                max={experience + xpToNext}
                level={level}
              />
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
              <StatCell
                icon={Flame}
                label="Streak"
                value={hasStats ? `${streak} day${streak === 1 ? "" : "s"}` : "—"}
                tone="streak"
              />
              <StatCell
                icon={Sparkles}
                label="Achievements"
                value={achievementsCount}
                tone="level"
              />
              <StatCell
                icon={Award}
                label="Badges"
                value={badgesCount}
                tone="info"
              />
              <StatCell
                icon={Calendar}
                label="Member for"
                value={hasStats ? `${daysSinceRegistration}d` : "—"}
                tone="success"
              />
            </div>
          </CardContent>
        </Card>

        </BentoItem>

        {/* Savings goal */}
        <BentoItem span={4}>
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-savings" />
              Savings Goal
            </CardTitle>
            <CardDescription>
              {goalReached ? "Goal reached — nice work." : "Progress toward your target."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingStats ? (
              <Skeleton className="h-2 w-full" />
            ) : savingsGoal > 0 ? (
              <>
                <Progress
                  value={Math.min(savingsProgress, 100)}
                  className={goalReached ? "bg-success/20" : undefined}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <Money value={totalSavings} currency={DEFAULT_CURRENCY} size="sm" />
                  <Money value={savingsGoal} currency={DEFAULT_CURRENCY} size="sm" />
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(savingsProgress)}% complete
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Set a savings goal below to start tracking progress.
              </p>
            )}
          </CardContent>
        </Card>
        </BentoItem>
      </BentoGrid>

      {/* Financial snapshot */}
      <BentoGrid>
        <BentoItem span={6}>
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-savings" />
              Total Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <Money value={totalSavings} currency={DEFAULT_CURRENCY} tone="income" size="lg" />
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {hasStats ? `${totalTransactions} transactions recorded` : "Lifetime balance"}
            </p>
          </CardContent>
        </Card>
        </BentoItem>
        <BentoItem span={6}>
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingDown className="h-4 w-4 text-expense" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <Money
                value={stats?.totalExpenses ?? profile?.totalExpenses ?? 0}
                currency={DEFAULT_CURRENCY}
                tone="expense"
                size="lg"
              />
            )}
            <p className="mt-1 text-xs text-muted-foreground">Lifetime spending</p>
          </CardContent>
        </Card>
        </BentoItem>
      </BentoGrid>

      {/* Profile form */}
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>
            Update your display name and savings goal. Email is managed by your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg" alt={displayName} />
                <AvatarFallback className="text-lg">
                  {displayName ? displayName.charAt(0).toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-lg font-semibold">{displayName || "—"}</span>
                <span className="text-sm text-muted-foreground">{email || "—"}</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  disabled={isLoadingProfile || isMutating}
                  placeholder="Your name"
                  aria-invalid={errors.name ? "true" : "false"}
                  {...register("name", {
                    required: "Name is required",
                    minLength: { value: 2,
                      message: "Name must be at least 2 characters" },
                  })}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="savingsGoal">Savings Goal ({DEFAULT_CURRENCY})</Label>
                <Input
                  id="savingsGoal"
                  type="number"
                  min={0}
                  step={100}
                  disabled={isLoadingProfile || isMutating}
                  placeholder="10000"
                  {...register("savingsGoal", {
                    validate: (v) => {
                      const n = Number(v);
                      if (Number.isNaN(n)) { return "Must be a number"; }
                      if (n < 0) { return "Must be ≥ 0"; }
                      return true;
                    },
                  })}
                />
                {errors.savingsGoal && (
                  <p className="text-xs text-destructive">
                    {errors.savingsGoal.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} disabled readOnly />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={!isDirty || isMutating}>
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!isDirty || isMutating}
              onClick={() =>
                reset({
                  name: profile?.name ?? "",
                  savingsGoal:
                    profile?.savingsGoal != null ? String(profile.savingsGoal) : "0",
                })
              }
            >
              Reset
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the app looks. Current theme:{" "}
            <span className="font-semibold capitalize">{theme}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Quick Toggle</Label>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <span className="text-xs text-muted-foreground">Click the icon</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Toggle (with text)</Label>
            <ThemeToggleWithText />
          </div>
          <div className="space-y-2">
            <Label>Theme Selector</Label>
            <ThemeSelector className="w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
