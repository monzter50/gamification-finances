"use client";

import { ArrowRight, CreditCard, Plus, Receipt, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

import {
  BentoGrid,
  BentoItem,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Money,
  PageHeader,
  Progress,
  Skeleton,
  Stat,
  TransactionRow,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useBudget, useMonthlySummary, useTransactions } from "@/hooks";
import type { Account } from "@/types/api";
import type { Budget } from "@/types/budget";
import { MONTHS } from "@/types/budget";

// Default currency for this app. When user-currency lands, move to a context.
const DEFAULT_CURRENCY = "MXN";

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
      <Money value={account.balance} currency={account.currency} size="sm" />
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
  const currentMonth = today.getMonth();
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
    [ accounts ],
  );

  // ---- Derived: budget progress ----
  const budgetProgress = useMemo(() => {
    if (!currentBudget) { return null; }
    const totalPlanned = currentBudget.totalExpense ?? 0;
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
    [ accounts ],
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
      <PageHeader
        title={`${greeting} 👋`}
        description={`${monthLabel} ${currentYear} — here's your financial snapshot.`}
        actions={
          <Button onClick={() => navigate("/transactions")}>
            <Plus className="mr-2 h-4 w-4" />
            Log transaction
          </Button>
        }
      />

      {/* KPI row */}
      <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Total Balance"
          value={totalBalance}
          currency={DEFAULT_CURRENCY}
          icon={<Wallet size={16} />}
        />
        <Stat
          label="Income (this month)"
          value={monthly?.totalIncome ?? 0}
          currency={DEFAULT_CURRENCY}
          tone="income"
          icon={<TrendingUp size={16} />}
          loading={isLoadingMonthly}
        />
        <Stat
          label="Expenses (this month)"
          value={monthly?.totalExpense ?? 0}
          currency={DEFAULT_CURRENCY}
          tone="expense"
          icon={<TrendingDown size={16} />}
          loading={isLoadingMonthly}
        />
        <Stat
          label="Net (this month)"
          value={monthly?.netBalance ?? 0}
          currency={DEFAULT_CURRENCY}
          tone="auto"
          loading={isLoadingMonthly}
        />
      </div>

      {/* Two-column section */}
      <BentoGrid>
        {/* Current budget */}
        <BentoItem span={8}>
        <Card className="h-full">
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
              <EmptyState
                title="No budget yet"
                description={`Plan your ${monthLabel.toLowerCase()} income and expenses to start tracking.`}
                action={
                  <Button onClick={() => navigate("/budget")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create budget
                  </Button>
                }
              />
            ) : budgetProgress && budgetProgress.totalPlanned > 0 ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-sm font-medium">Expenses used</span>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      <Money value={budgetProgress.totalSpent} currency={DEFAULT_CURRENCY} size="sm" />
                      {" / "}
                      <Money value={budgetProgress.totalPlanned} currency={DEFAULT_CURRENCY} size="sm" />
                    </span>
                  </div>
                  <Progress value={budgetProgress.pct} />
                  <p className={budgetProgress.remaining >= 0
                    ? "text-xs mt-1 text-muted-foreground"
                    : "text-xs mt-1 text-danger"}>
                    {budgetProgress.remaining >= 0
                      ? <>
                        <Money value={budgetProgress.remaining} currency={DEFAULT_CURRENCY} size="sm" />
                        {" "}remaining ({(100 - budgetProgress.pct).toFixed(0)}%)
                      </>
                      : <>
                        Over budget by{" "}
                        <Money value={Math.abs(budgetProgress.remaining)} currency={DEFAULT_CURRENCY} size="sm" tone="expense" />
                      </>}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Planned income</p>
                    <Money value={currentBudget.totalIncome ?? 0} currency={DEFAULT_CURRENCY} size="sm" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Net savings target</p>
                    <Money value={currentBudget.netSavings ?? 0} currency={DEFAULT_CURRENCY} size="sm" />
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

        </BentoItem>

        {/* Accounts snapshot */}
        <BentoItem span={4}>
        <Card className="h-full">
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
              <EmptyState
                icon={<Wallet size={20} />}
                title="No accounts yet"
                description="Create an account to start tracking balances."
                action={
                  <Button variant="outline" onClick={() => navigate("/accounts")}>
                    <Plus className="mr-2 h-4 w-4" />
                    New account
                  </Button>
                }
              />
            ) : (
              <div className="divide-y divide-border">
                {topAccounts.map((a) => (
                  <AccountSnapshotRow key={a.id} account={a} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </BentoItem>
      </BentoGrid>

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
            <EmptyState
              icon={<Receipt size={20} />}
              title="No transactions yet"
              description="Log your first one to get started."
              action={
                <Button onClick={() => navigate("/transactions")} disabled={!hasAccounts}>
                  <Plus className="mr-2 h-4 w-4" />
                  Log transaction
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-border">
              {recentTx.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  vendor={tx.vendor}
                  date={tx.date}
                  amount={tx.amount}
                  type={tx.type}
                  accountName={accountNameById.get(tx.accountId)}
                  currency={DEFAULT_CURRENCY}
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
