import { inlineCellVariants } from "@/components/ui/inline-cell";
import { Money, type MoneyTone } from "@/components/ui/money";
import { MoneyInput } from "@/components/ui/money-input";
import { useInlineEdit } from "@/components/ui/use-inline-edit";
import { cn } from "@/lib/utils";

export interface InlineMoneyProps {
  value: number;
  /** Column name for screen readers, e.g. "Amount". */
  label: string;
  currency: string;
  tone?: MoneyTone;
  /** Called only with amounts greater than 0. */
  // eslint-disable-next-line no-unused-vars
  onCommit: (value: number) => Promise<void> | void;
  className?: string;
}

/**
 * InlineMoney — Notion-style amount cell. Renders <Money> at rest; click turns
 * it into a <MoneyInput>. Enter or blur saves, Escape cancels.
 */
export const InlineMoney = ({
  value,
  label,
  currency,
  tone = "neutral",
  onCommit,
  className,
}: InlineMoneyProps) => {
  const edit = useInlineEdit<number | null>({
    value,
    onCommit: (next) => onCommit(next ?? 0),
    isValid: (next) => next !== null && next > 0,
  });

  if (edit.isEditing) {
    return (
      <MoneyInput
        {...edit.editorProps}
        aria-label={label}
        value={edit.draft}
        onChange={edit.setDraft}
        currency={currency}
        className={cn("h-10", className)}
      />
    );
  }

  return (
    <button
      ref={edit.displayRef}
      type="button"
      onClick={edit.startEdit}
      className={cn(inlineCellVariants({ align: "end" }), className)}
    >
      <span className="sr-only">{label}: </span>
      <Money value={edit.shown ?? 0} currency={currency} tone={tone} />
    </button>
  );
};
