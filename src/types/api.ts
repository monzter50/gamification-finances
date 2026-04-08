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
export interface Pagination {
  page: number;
  pages: number;
  total: number;
  limit: number;
}

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

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  userId: string;
  budgetId: string | null;
  date: string; // ISO 8601
  amount: number;
  vendor: string;
  category: string;
  type: TransactionType;
  owner: string;
  accountId: string;
  description: string | null;
  incomeItemId: string | null;
  expenseItemId: string | null;
  isInstallment: boolean;
  installmentCurrent: number | null;
  installmentTotal: number | null;
  installmentOriginal: number | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  budget?: {
    id: string;
    year: number;
    month: number;
  } | null;
  incomeItem?: {
    id: string;
    description: string;
    amount: number;
    type: string;
  } | null;
  expenseItem?: {
    id: string;
    description: string;
    amount: number;
    type: string;
  } | null;
}

export interface CreateTransactionDto {
  budgetId: string;
  date: string; // ISO 8601 e.g. "2026-02-16"
  amount: number;
  vendor: string;
  category: string;
  type: TransactionType;
  owner: string;
  accountId: string;
  description?: string;
  incomeItemId?: string;
  expenseItemId?: string;
  isInstallment?: boolean;
  installmentCurrent?: number;
  installmentTotal?: number;
  installmentOriginal?: number;
}

export interface UpdateTransactionDto extends Partial<CreateTransactionDto> {}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: TransactionType;
  budgetId?: string;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message: string;
}

export interface ApiError {
  success: false;
  error: string;
  statusCode: number;
}

export interface ValidationError {
  success: false;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  incomeCount: number;
  expenseCount: number;
  netBalance: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
}

export interface MonthlySummary extends FinancialSummary {
  year: number;
  month: number;
  categoryBreakdown: CategoryBreakdown[];
}

export interface IncomeBreakdown {
  id: string;
  description: string;
  available: number;
  used: number;
  remaining: number;
  percentUsed: number;
}

export interface ExpenseBreakdown {
  id: string;
  description: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentUsed: number;
}

export interface BudgetBalance {
  budgetId: string;
  totalBudgetedIncome: number;
  totalBudgetedExpense: number;
  incomeBreakdown: IncomeBreakdown[];
  expenseBreakdown: ExpenseBreakdown[];
}

// Legacy types (kept for backward compatibility)
export interface CreateTransactionRequest extends CreateTransactionDto {}

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

// ==================== Account Types ====================

export type AccountType = "checking" | "savings" | "credit_card" | "vales";

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountDto {
  name: string;
  type: AccountType;
}

export interface UpdateAccountDto {
  name?: string;
  type?: AccountType;
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
