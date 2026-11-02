import * as React from "react";

import { inlineCellVariants } from "@/components/ui/inline-cell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface InlineSelectOption {
  value: string;
  label: string;
}

export interface InlineSelectProps {
  value: string;
  /** Column name for screen readers, e.g. "Account". */
  label: string;
  options: readonly InlineSelectOption[];
  placeholder?: string;
  /** Shown inside the open list when there are no options. */
  emptyMessage?: string;
  // eslint-disable-next-line no-unused-vars
  onCommit: (value: string) => Promise<void> | void;
  className?: string;
}

/**
 * InlineSelect — Notion-style select cell. Looks like plain text with a faint
 * chevron; picking an option saves straight away.
 */
export const InlineSelect = ({
  value,
  label,
  options,
  placeholder = "Empty",
  emptyMessage = "No options",
  onCommit,
  className,
}: InlineSelectProps) => {
  // Shown while the save is in flight so the cell doesn't flash the old value.
  const [pending, setPending] = React.useState<string | null>(null);

  const handleValueChange = async (next: string) => {
    if (next === value) {
      return;
    }
    setPending(next);
    try {
      await onCommit(next);
    } catch {
      // The caller already surfaced the error; showing the stored value again is the rollback.
    } finally {
      setPending(null);
    }
  };

  return (
    <Select value={pending ?? value} onValueChange={handleValueChange}>
      <SelectTrigger
        aria-label={label}
        className={cn(
          inlineCellVariants(),
          "justify-between border-transparent bg-transparent focus:ring-2 focus:ring-offset-0",
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.length === 0 ? (
          <p className="px-2 py-1.5 text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};
