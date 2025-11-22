/**
 * API Types based on API documentation
 */

// ==================== Common Types ====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// ==================== Authentication Types ====================

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterResponse {
  userId: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
}

// ==================== User Types ====================

export interface UserProfileData {
  id: string;
  email: string;
  name: string;
  level: number;
  experience: number;
  coins: number;
  totalSavings: number;
  totalExpenses: number;
  savingsGoal: number;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  savingsGoal?: number;
}

export interface UserStats {
  totalTransactions: number;
  currentStreak: number;
  totalSavings: number;
  totalExpenses: number;
  savingsGoal: number;
  savingsProgress: number;
  savingsGoalReached: boolean;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  levelProgress: number;
  coins: number;
  totalAchievements: number;
  totalBadges: number;
  isActive: boolean;
  lastLogin: string;
  daysSinceRegistration: number;
}

// ==================== Transaction Types ====================

export type TransactionType = "income" | "expense" | "savings";

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: string;
  userId: string;
}

export interface CreateTransactionRequest {
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface TransactionSummary {
  income: {
    total: number;
    count: number;
    experience: number;
    coins: number;
  };
  expense: {
    total: number;
    count: number;
    experience: number;
    coins: number;
  };
  savings: {
    total: number;
    count: number;
    experience: number;
    coins: number;
  };
  netWorth: number;
  savingsProgress: number;
}

// ==================== Achievement Types ====================

export type AchievementRarity = "common" | "rare" | "epic" | "legendary";
export type AchievementCategory = "savings" | "expense" | "income" | "streak" | "level";

export interface AchievementCriteria {
  type: string;
  value: number;
  timeframe: string;
}

export interface AchievementReward {
  experience: number;
  coins: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  criteria: AchievementCriteria;
  reward: AchievementReward;
  rarity: AchievementRarity;
  rarityColor: string;
  isActive: boolean;
}

export interface UserAchievement extends Achievement {
  isUnlocked: boolean;
  unlockDate: string | null;
  progress: number;
}

export interface UserAchievementsResponse {
  achievements: UserAchievement[];
  totalAchievements: number;
  unlockedAchievements: number;
  completionPercentage: number;
}

export interface UnlockAchievementResponse {
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: AchievementRarity;
    rarityColor: string;
  };
  rewards: AchievementReward;
  userStats: {
    level: number;
    experience: number;
    coins: number;
    totalAchievements: number;
  };
}

// ==================== Gamification Types ====================

export interface GamificationProfile {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  levelProgress: number;
  coins: number;
  totalSavings: number;
  totalExpenses: number;
  savingsGoal: number;
  savingsProgress: number;
  achievements: {
    total: number;
    unlocked: number;
    completionPercentage: number;
  };
  badges: {
    total: number;
    unlocked: number;
  };
  stats: {
    daysActive: number;
    lastLogin: string;
    isActive: boolean;
  };
}

export interface LevelUpResponse {
  oldLevel: number;
  newLevel: number;
  oldExperience: number;
  newExperience: number;
  experienceGained: number;
  leveledUp: boolean;
  levelProgress: number;
  experienceToNextLevel: number;
  coins: number;
}

export type LeaderboardType = "level" | "coins" | "savings" | "experience";

export interface LeaderboardEntry {
  position: number;
  name: string;
  level: number;
  experience: number;
  coins: number;
  totalSavings: number;
  totalExpenses: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  type: LeaderboardType;
  limit: number;
  userPosition: number;
  userStats: {
    name: string;
    level: number;
    experience: number;
    coins: number;
    totalSavings: number;
    totalExpenses: number;
  };
}

export interface ProgressStats {
  weekly: {
    experience: number;
    coins: number;
    transactions: number;
  };
  monthly: {
    experience: number;
    coins: number;
    transactions: number;
  };
  allTime: {
    experience: number;
    coins: number;
    transactions: number;
    level: number;
    achievements: number;
  };
}

export interface AddCoinsRequest {
  amount: number;
}

export interface AddCoinsResponse {
  oldCoins: number;
  newCoins: number;
  coinsAdded: number;
}
