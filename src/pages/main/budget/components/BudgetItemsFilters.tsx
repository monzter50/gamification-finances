import { Search, X } from "lucide-react";

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

interface BudgetItemsFiltersProps {
  search: string;
  // eslint-disable-next-line no-unused-vars
  onSearchChange: (value: string) => void;
  typeFilter: string;
  // eslint-disable-next-line no-unused-vars
  onTypeChange: (value: string) => void;
  typeOptions: readonly string[];
  hasActiveFilters: boolean;
  onClear: () => void;
}

export const BudgetItemsFilters = ({
  search,
  onSearchChange,
  typeFilter,
  onTypeChange,
  typeOptions,
  hasActiveFilters,
  onClear,
}: BudgetItemsFiltersProps) => (
  <div className="grid gap-3 md:grid-cols-[1fr_220px_auto] items-end">
    <div className="flex flex-col space-y-1.5">
      <Label htmlFor="item-search">Search</Label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="item-search"
          value={search}
          placeholder="Search by description"
          className="pl-8"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>

    <div className="flex flex-col space-y-1.5">
      <Label htmlFor="item-type">Type</Label>
      <Select value={typeFilter} onValueChange={onTypeChange}>
        <SelectTrigger id="item-type"><SelectValue placeholder="All types" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {typeOptions.map((t) => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <Button
      variant="ghost"
      onClick={onClear}
      disabled={!hasActiveFilters}
      className="justify-self-start"
    >
      <X className="mr-1 h-4 w-4" />
      Clear
    </Button>
  </div>
);
