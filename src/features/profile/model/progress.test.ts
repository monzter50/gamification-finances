import { describe, expect, it } from "vitest";

import { deriveProgress } from "@/features/profile/model/progress";
import type { UserProfileData, UserStats } from "@/types/api";

const profile: UserProfileData = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana",
  level: 3,
  experience: 420,
  coins: 50,
  totalSavings: 2500,
  totalExpenses: 900,
  savingsGoal: 10000,
  isActive: true,
  lastLogin: "",
  createdAt: "",
  updatedAt: "",
};

describe("deriveProgress", () => {
  it("falls back to the profile when stats aren't available", () => {
    const p = deriveProgress(profile, null, null);
    expect(p).toMatchObject({ level: 3, coins: 50, savingsProgress: 25, goalReached: false });
    expect(p.streak).toBeNull();
    expect(p.totalTransactions).toBeNull();
  });

  it("prefers stats over the profile", () => {
    const stats = {
      level: 4,
      currentStreak: 6,
      savingsProgress: 40,
      savingsGoalReached: false,
    } as UserStats;
    expect(deriveProgress(profile, stats, null)).toMatchObject({
      level: 4,
      streak: 6,
      savingsProgress: 40,
    });
  });

  it("caps progress at 100% and marks the goal reached", () => {
    const p = deriveProgress({ ...profile, totalSavings: 15000 }, null, null);
    expect(p.savingsProgress).toBe(100);
    expect(p.goalReached).toBe(true);
  });

  it("treats a zero goal as no goal", () => {
    expect(deriveProgress({ ...profile, savingsGoal: 0 }, null, null)).toMatchObject({
      savingsProgress: 0,
      goalReached: false,
    });
  });
});
