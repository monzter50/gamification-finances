import { inlineCellVariants } from "@/components/ui/inline-cell";
import { Input } from "@/components/ui/input";
import { useInlineEdit } from "@/components/ui/use-inline-edit";
import { cn } from "@/lib/utils";

export interface InlineDateProps {
  /** Calendar day as `yyyy-mm-dd`. */
  value: string;
  /** Column name for screen readers, e.g. "Date". */
  label: string;
  // eslint-disable-next-line no-unused-vars
  onCommit: (value: string) => Promise<void> | void;
  className?: string;
}

/** "2026-10-14" → "Oct 14, 2026" in the viewer's locale, read as a local day (no UTC shift). */
const formatDay = (isoDay: string): string => {
  const date = new Date(`${isoDay}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? isoDay
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

/**
 * InlineDate — Notion-style date cell. Shows a short date; click turns it into
 * a native date input. Enter or blur saves, Escape cancels.
 */
export const InlineDate = ({ value, label, onCommit, className }: InlineDateProps) => {
  const edit = useInlineEdit({
    value,
    onCommit,
    isValid: (next: string) => next !== "",
  });

  if (edit.isEditing) {
    return (
      <Input
        {...edit.editorProps}
        type="date"
        aria-label={label}
        value={edit.draft}
        onChange={(event) => edit.setDraft(event.target.value)}
        className={cn("h-10", className)}
      />
    );
  }

  return (
    <button
      ref={edit.displayRef}
      type="button"
      onClick={edit.startEdit}
      className={cn(inlineCellVariants(), "tabular-nums", className)}
    >
      <span className="sr-only">{label}: </span>
      <span className="truncate">{formatDay(edit.shown)}</span>
    </button>
  );
};
