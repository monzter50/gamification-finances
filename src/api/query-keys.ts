/**
 * The single query-key registry. Never write a query key inline.
 *
 * Keys are hierarchical: invalidating a prefix invalidates everything under
 * it — `budgets.detail(id)` also refreshes that budget's income/expense lists.
 */
type Params = Record<string, unknown>;

export const queryKeys = {
  budgets: {
    all: ["budgets"] as const,
    list: (params: Params = {}) => ["budgets", "list", params] as const,
    detail: (id: string) => ["budgets", "detail", id] as const,
    income: (id: string, params: Params = {}) =>
      ["budgets", "detail", id, "income", params] as const,
    expense: (id: string, params: Params = {}) =>
      ["budgets", "detail", id, "expense", params] as const,
    balance: (id: string) => ["budgets", "detail", id, "balance"] as const,
  },
  accounts: {
    all: ["accounts"] as const,
    list: () => ["accounts", "list"] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    list: (params: Params = {}) => ["transactions", "list", params] as const,
    detail: (id: string) => ["transactions", "detail", id] as const,
    summary: (params: Params = {}) => ["transactions", "summary", params] as const,
  },
  user: {
    all: ["user"] as const,
    profile: () => ["user", "profile"] as const,
    stats: () => ["user", "stats"] as const,
  },
  gamification: {
    all: ["gamification"] as const,
    achievements: () => ["gamification", "achievements"] as const,
    userAchievements: () => ["gamification", "achievements", "user"] as const,
  },
} as const;
