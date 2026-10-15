import { inlineCellVariants } from "@/components/ui/inline-cell";
import { Input } from "@/components/ui/input";
import { useInlineEdit } from "@/components/ui/use-inline-edit";
import { cn } from "@/lib/utils";

export interface InlineTextProps {
  value: string;
  /** Column name for screen readers, e.g. "Description". */
  label: string;
  /** Shown when the value is empty. */
  placeholder?: string;
  /** Called with the trimmed text. Empty text is never committed. */
  // eslint-disable-next-line no-unused-vars
  onCommit: (value: string) => Promise<void> | void;
  className?: string;
}

/**
 * InlineText — Notion-style text cell. Reads as plain text; click (or Enter)
 * turns it into an input. Enter or blur saves, Escape cancels.
 */
export const InlineText = ({
  value,
  label,
  placeholder = "Empty",
  onCommit,
  className,
}: InlineTextProps) => {
  const edit = useInlineEdit({
    value,
    onCommit: (next: string) => onCommit(next.trim()),
    isValid: (next) => next.trim() !== "",
  });

  if (edit.isEditing) {
    return (
      <Input
        {...edit.editorProps}
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
      className={cn(inlineCellVariants(), "font-medium", className)}
    >
      <span className="sr-only">{label}: </span>
      <span className={cn("truncate", !edit.shown && "text-muted-foreground")}>
        {edit.shown || placeholder}
      </span>
    </button>
  );
};
