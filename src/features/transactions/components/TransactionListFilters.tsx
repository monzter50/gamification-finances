import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_FILTERS,
  type TransactionListFilterValues,
} from "@/features/transactions/model/list-filters";
import type { Budget } from "@/types/budget";
import { MONTHS } from "@/types/budget";

interface TransactionListFiltersProps {
  value: TransactionListFilterValues;
  budgets: Budget[];
  // eslint-disable-next-line no-unused-vars
  onChange: (next: TransactionListFilterValues) => void;
  onReset: () => void;
}

export { DEFAULT_FILTERS, type TransactionListFilterValues };

export function TransactionListFilters({
  value,
  budgets,
  onChange,
  onReset,
}: TransactionListFiltersProps) {
  const hasAny =
    value.budgetId !== "" || value.type !== "all" || value.startDate !== "" || value.endDate !== "";

  return (
    <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto] items-end">
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="filter-budget">Budget</Label>
        <Select
          value={value.budgetId || "all"}
          onValueChange={(v) => onChange({ ...value, budgetId: v === "all" ? "" : v })}
        >
          <SelectTrigger id="filter-budget">
            <SelectValue placeholder="All budgets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All budgets</SelectItem>
            {budgets.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {MONTHS[b.month]} {b.year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="filter-type">Type</Label>
        <Select
          value={value.type}
          onValueChange={(v) =>
            onChange({ ...value, type: v as TransactionListFilterValues["type"] })
          }
        >
          <SelectTrigger id="filter-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="filter-start">From</Label>
        <Input
          id="filter-start"
          type="date"
          value={value.startDate}
          onChange={(e) => onChange({ ...value, startDate: e.target.value })}
        />
      </div>

      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="filter-end">To</Label>
        <Input
          id="filter-end"
          type="date"
          value={value.endDate}
          onChange={(e) => onChange({ ...value, endDate: e.target.value })}
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onReset}
        disabled={!hasAny}
        className="h-9"
      >
        <X className="h-4 w-4 mr-1" />
        Clear
      </Button>
    </div>
  );
}
