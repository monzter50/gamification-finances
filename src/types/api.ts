/**
 * API Types based on API documentation
 */

// ==================== Generic API Response Types ====================

/**
 * Generic API response structure
 * @template T - The type of data in the response
 */
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
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
  expiresIn: number;
}

export interface RegisterResponse {
  userId: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  levelProgress: number;
  coins: number;
  totalSavings: number;
  totalExpenses: number;
  savingsGoal: number;
  savingsProgress?: number;
  achievements: string[];
  badges: string[];
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== User Types ====================

export interface UserBasicInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  level: number;
  experience: number;
  coins: number;
}
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
