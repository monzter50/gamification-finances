import { useEffect, useMemo, useState } from "react";

import { useDebouncedValue } from "./useDebouncedValue";

/** Minimal shape both IncomeItem and ExpenseItem satisfy. */
interface FilterableItem {
  description: string;
  type: string;
}

export interface UseBudgetItemsResult<T> {
  /** Items for the current page (after filter + pagination). */
  pageItems: T[];
  /** Count after filtering (before pagination). */
  totalItems: number;
  totalPages: number;
  /** Effective current page (always clamped to [1, totalPages]). */
  currentPage: number;
  nextPage: () => void;
  prevPage: () => void;
  // filters
  typeFilter: string; // "all" or a concrete type
  // eslint-disable-next-line no-unused-vars
  setTypeFilter: (v: string) => void;
  search: string;
  // eslint-disable-next-line no-unused-vars
  setSearch: (v: string) => void;
  itemsPerPage: number;
  // eslint-disable-next-line no-unused-vars
  setItemsPerPage: (n: number) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

/**
 * Client-side filtering + pagination for a budget's income/expense items.
 *
 * The full item set already lives in memory (`currentBudget.{income,expense}Items`,
 * kept current by every CRUD), and the backend endpoints only accept page/limit
 * — so filtering + paging here is both correct (over the whole dataset) and
 * instant (no network on page/filter change).
 */
export function useBudgetItems<T extends FilterableItem>(
  allItems: T[],
  defaultItemsPerPage = 5,
): UseBudgetItemsResult<T> {
  const [ typeFilter, setTypeFilter ] = useState("all");
  const [ search, setSearch ] = useState("");
  const [ itemsPerPage, setItemsPerPage ] = useState(defaultItemsPerPage);
  const [ page, setPage ] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 250);

  // Reset to the first page whenever the result set changes shape.
  useEffect(() => {
    setPage(1);
  }, [ typeFilter, debouncedSearch, itemsPerPage ]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return allItems.filter(
      (item) =>
        (typeFilter === "all" || item.type === typeFilter) &&
        (q === "" || item.description.toLowerCase().includes(q)),
    );
  }, [ allItems, typeFilter, debouncedSearch ]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  // Clamp inline so a stale page (e.g. after deletes) never renders out of range.
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [ filtered, currentPage, itemsPerPage ],
  );

  const hasActiveFilters = typeFilter !== "all" || search.trim() !== "";

  return {
    pageItems,
    totalItems,
    totalPages,
    currentPage,
    nextPage: () => setPage(Math.min(currentPage + 1, totalPages)),
    prevPage: () => setPage(Math.max(currentPage - 1, 1)),
    typeFilter,
    setTypeFilter,
    search,
    setSearch,
    itemsPerPage,
    setItemsPerPage,
    hasActiveFilters,
    clearFilters: () => {
      setTypeFilter("all");
      setSearch("");
    },
  };
}
