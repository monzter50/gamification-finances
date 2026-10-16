import { FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
} from "@/components/ui";
import { useBudgetsList } from "@/features/budget";
import {
  DEFAULT_FILTERS,
  TransactionListFilters,
  TransactionsPanel,
  TransactionSummaryStats,
  findBudgetIdForDay,
  hasActiveFilters,
  toIsoDay,
  toTransactionFilters,
} from "@/features/transactions";
import type { Budget } from "@/types/budget";

const PAGE_SIZE = 10;
const NO_BUDGETS: Budget[] = [];

const TransactionsPage = () => {
  const { data: budgets = NO_BUDGETS } = useBudgetsList();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const handleReset = () => setFilters(DEFAULT_FILTERS);

  return (
    <div className="space-y-stack">
      <PageHeader
        title="Transactions"
        description="All income & expenses across your budgets. Every change updates your account balance."
        actions={
          <Button variant="outline" asChild>
            <Link to="/transactions/import-xlsx">
              <FileSpreadsheet aria-hidden="true" />
              Import Excel
            </Link>
          </Button>
        }
      />

      <TransactionSummaryStats />

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Narrow down the list by budget, type, or date range.</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionListFilters
            value={filters}
            budgets={budgets}
            onChange={setFilters}
            onReset={handleReset}
          />
        </CardContent>
      </Card>

      <TransactionsPanel
        title="All Transactions"
        filters={toTransactionFilters(filters)}
        pageSize={PAGE_SIZE}
        budgets={budgets}
        defaultDate={toIsoDay(new Date())}
        resolveBudgetId={(day) => findBudgetIdForDay(budgets, day)}
        hasActiveFilters={hasActiveFilters(filters)}
        onClearFilters={handleReset}
      />
    </div>
  );
};

export default TransactionsPage;
