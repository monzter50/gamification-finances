"use client";

import { ArrowRight, CreditCard, Plus, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useBudget, useMonthlySummary, useTransactions } from "@/hooks";
import type { Account, Transaction, TransactionType } from "@/types/api";
import type { Budget } from "@/types/budget";
import { MONTHS } from "@/types/budget";

const MXN = (n: number) =>
  n.toLocaleString("es-MX", { minimumFractionDigits: 2,
    maximumFractionDigits: 2 });

interface KpiCardProps {
  label:    string;
  value:    string;
  sub?:     string;
  accent?:  "neutral" | "income" | "expense" | "positive" | "negative";
  loading?: boolean;
  icon?:    React.ReactNode;
}

const ACCENTS: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  neutral:  "",
  income:   "text-green-600 dark:text-green-400",
  expense:  "text-red-600 dark:text-red-400",
  positive: "text-blue-600 dark:text-blue-400",
  negative: "text-red-600 dark:text-red-400",
};

function KpiCard({ label, value, sub, accent = "neutral", loading, icon }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3 w-24 mt-2" />
          </>
        ) : (
          <>
            <div className={`text-2xl font-bold ${ACCENTS[accent]}`}>{value}</div>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TypePill({ type }: { type: TransactionType }) {
  const className = type === "income"
    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${className}`}>
      {type === "income" ? "Income" : "Expense"}
    </span>
  );
}

interface RecentTxRowProps {
  tx: Transaction;
  accountName?: string;
  // eslint-disable-next-line no-unused-vars
  onClick: (tx: Transaction) => void;
}

function RecentTxRow({ tx, accountName, onClick }: RecentTxRowProps) {
  const amountClass = tx.type === "income"
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";
  const sign = tx.type === "income" ? "+" : "−";

  return (
    <button
      type="button"
      onClick={() => onClick(tx)}
      className="w-full flex items-center gap-3 py-2 px-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors text-left"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{tx.vendor}</p>
        <p className="text-xs text-muted-foreground truncate">
          {new Date(tx.date).toLocaleDateString("en-US", { month: "short",
            day: "numeric" })}
          {accountName ? ` · ${accountName}` : ""}
        </p>
      </div>
      <TypePill type={tx.type} />
      <span className={`text-sm font-semibold w-24 text-right tabular-nums ${amountClass}`}>
        {sign}${MXN(tx.amount)}
      </span>
    </button>
  );
}

interface AccountSnapshotRowProps {
  account: Account;
}

function AccountSnapshotRow({ account }: AccountSnapshotRowProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
        <CreditCard size={14} className="text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{account.name}</p>
        <p className="text-xs text-muted-foreground capitalize">{account.type.replace("_", " ")}</p>
      </div>
      <p className="text-sm font-semibold tabular-nums">
        ${MXN(account.balance)} <span className="text-[10px] text-muted-foreground">{account.currency}</span>
      </p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { accounts, user } = useAuth();
  const { fetchBudgets } = useBudget();

  // ---- Current period ----
  const today = useMemo(() => new Date(), []);
  const currentYear  = today.getFullYear();
  const currentMonth = today.getMonth();            // 0-indexed (for Budget filter)
  const monthLabel   = MONTHS[currentMonth];

  // ---- Monthly summary (1-indexed month on the API) ----
  const { summary: monthly, loading: isLoadingMonthly } = useMonthlySummary({
    year:  currentYear,
    month: currentMonth + 1,
  });

  // ---- Current month's budget ----
  const [ currentBudget, setCurrentBudget ] = useState<Budget | null>(null);
  const [ isLoadingBudget, setIsLoadingBudget ] = useState(true);
  const hasFetchedBudget = useRef(false);

  useEffect(() => {
    if (hasFetchedBudget.current) { return; }
    hasFetchedBudget.current = true;

    setIsLoadingBudget(true);
    fetchBudgets({ year: currentYear,
      month: currentMonth })
      .then((list) => setCurrentBudget(list?.[0] ?? null))
      .catch(() => setCurrentBudget(null))
      .finally(() => setIsLoadingBudget(false));
  }, [ fetchBudgets, currentYear, currentMonth ]);

  // ---- Recent transactions ----
  const recentFilters = useMemo(() => ({ page: 1,
    limit: 5 }), []);
  const { transactions: recentTx, isLoading: isLoadingRecent } = useTransactions({
    filters: recentFilters,
  });

  // ---- Derived: total balance ----
  const totalBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + a.balance, 0),
    [ accounts ]
  );

  // ---- Derived: budget progress ----
  const budgetProgress = useMemo(() => {
    if (!currentBudget) { return null; }

    const totalPlanned = currentBudget.totalExpense ?? 0;
    // We don't have "spent" directly on the budget — use the month's expense total
    // from the monthly summary (both are filtered to the same period).
    const totalSpent   = monthly?.totalExpense ?? 0;
    const pct          = totalPlanned > 0 ? Math.min(100, (totalSpent / totalPlanned) * 100) : 0;
    const remaining    = totalPlanned - totalSpent;

    return { totalPlanned,
      totalSpent,
      pct,
      remaining };
  }, [ currentBudget, monthly ]);

  // ---- Top 4 accounts for the snapshot ----
  const topAccounts = useMemo(
    () => [ ...accounts ].sort((a, b) => b.balance - a.balance).slice(0, 4),
    [ accounts ]
  );

  // ---- Account name lookup for recent tx rows ----
  const accountNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of accounts) { map.set(a.id, a.name); }
    return map;
  }, [ accounts ]);

  const hasAccounts = accounts.length > 0;
  const greeting    = user?.name ? `Hi, ${user.name.split(" ")[0]}` : "Welcome back";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-3xl font-bold">{greeting} 👋</h2>
          <p className="text-muted-foreground">
            {monthLabel} {currentYear} — here&apos;s your financial snapshot.
          </p>
        </div>
        <Button onClick={() => navigate("/transactions")}>
          <Plus className="mr-2 h-4 w-4" />
          Log transaction
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Balance"
          value={`$${MXN(totalBalance)}`}
          sub={`Across ${accounts.length} account${accounts.length === 1 ? "" : "s"}`}
          accent="neutral"
          loading={!hasAccounts && isLoadingMonthly}
          icon={<Wallet size={16} />}
        />
        <KpiCard
          label="Income (this month)"
          value={`$${MXN(monthly?.totalIncome ?? 0)}`}
          sub={`${monthly?.incomeCount ?? 0} transaction${monthly?.incomeCount === 1 ? "" : "s"}`}
          accent="income"
          loading={isLoadingMonthly}
          icon={<TrendingUp size={16} />}
        />
        <KpiCard
          label="Expenses (this month)"
          value={`$${MXN(monthly?.totalExpense ?? 0)}`}
          sub={`${monthly?.expenseCount ?? 0} transaction${monthly?.expenseCount === 1 ? "" : "s"}`}
          accent="expense"
          loading={isLoadingMonthly}
          icon={<TrendingDown size={16} />}
        />
        <KpiCard
          label="Net (this month)"
          value={`$${MXN(monthly?.netBalance ?? 0)}`}
          sub="Income − expenses"
          accent={(monthly?.netBalance ?? 0) >= 0 ? "positive" : "negative"}
          loading={isLoadingMonthly}
        />
      </div>

      {/* Two-column section */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Current budget (2 cols on lg) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>Budget · {monthLabel} {currentYear}</CardTitle>
                <CardDescription>
                  {currentBudget
                    ? "How much of your planned expenses you've used so far."
                    : "No budget for this month yet."}
                </CardDescription>
              </div>
              {currentBudget && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/budget/${currentBudget.id}`)}
                >
                  View <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingBudget ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : !currentBudget ? (
              <div className="flex flex-col items-center text-center py-6 gap-3">
                <p className="text-sm text-muted-foreground">
                  Plan your {monthLabel.toLowerCase()} income and expenses to start tracking.
                </p>
                <Button onClick={() => navigate("/budget")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create budget
                </Button>
              </div>
            ) : budgetProgress && budgetProgress.totalPlanned > 0 ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-sm font-medium">Expenses used</span>
                    <span className="text-sm tabular-nums">
                      ${MXN(budgetProgress.totalSpent)} / ${MXN(budgetProgress.totalPlanned)}
                    </span>
                  </div>
                  <Progress value={budgetProgress.pct} />
                  <p className={`text-xs mt-1 ${budgetProgress.remaining >= 0 ? "text-muted-foreground" : "text-red-600 dark:text-red-400"}`}>
                    {budgetProgress.remaining >= 0
                      ? `$${MXN(budgetProgress.remaining)} remaining (${(100 - budgetProgress.pct).toFixed(0)}%)`
                      : `Over budget by $${MXN(Math.abs(budgetProgress.remaining))}`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Planned income</p>
                    <p className="font-semibold">${MXN(currentBudget.totalIncome ?? 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Net savings target</p>
                    <p className="font-semibold">${MXN(currentBudget.netSavings ?? 0)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-6 text-center">
                This budget has no expense items yet.{" "}
                <button
                  type="button"
                  className="text-primary underline underline-offset-2"
                  onClick={() => navigate(`/budget/${currentBudget.id}`)}
                >
                  Add some
                </button>
                .
              </p>
            )}
          </CardContent>
        </Card>

        {/* Accounts snapshot */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>Accounts</CardTitle>
                <CardDescription>
                  {hasAccounts ? `Top ${topAccounts.length} by balance` : "No accounts yet"}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/accounts")}>
                View <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!hasAccounts ? (
              <div className="flex flex-col items-center text-center py-6 gap-3">
                <Wallet size={32} className="opacity-30" />
                <p className="text-sm text-muted-foreground">
                  Create an account to start tracking balances.
                </p>
                <Button variant="outline" onClick={() => navigate("/accounts")}>
                  <Plus className="mr-2 h-4 w-4" />
                  New account
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {topAccounts.map((a) => (
                  <AccountSnapshotRow key={a.id} account={a} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Your 5 most recent transactions.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/transactions")}>
              See all <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingRecent ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : recentTx.length === 0 ? (
            <div className="flex flex-col items-center text-center py-10 gap-3">
              <p className="text-sm text-muted-foreground">
                No transactions yet. Log your first one to get started.
              </p>
              <Button
                onClick={() => navigate("/transactions")}
                disabled={!hasAccounts}
              >
                <Plus className="mr-2 h-4 w-4" />
                Log transaction
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {recentTx.map((tx) => (
                <RecentTxRow
                  key={tx.id}
                  tx={tx}
                  accountName={accountNameById.get(tx.accountId)}
                  onClick={() => navigate("/transactions")}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
