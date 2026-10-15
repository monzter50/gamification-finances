import * as React from "react";

interface UseInlineEditOptions<T> {
  value: T;
  /** Reject to fall back to the stored value; the caller surfaces the error. */
  // eslint-disable-next-line no-unused-vars
  onCommit: (value: T) => Promise<void> | void;
  /** Return false to drop the edit and keep the stored value (e.g. empty text). */
  // eslint-disable-next-line no-unused-vars
  isValid?: (value: T) => boolean;
}

/**
 * State machine behind the inline cells: click to edit, Enter or blur to save,
 * Escape to cancel. While a save is in flight the cell shows the new value,
 * so it doesn't flash the old one before the parent's data refreshes.
 *
 * Internal to the design system — consume InlineText / InlineMoney instead.
 */
export function useInlineEdit<T>({
  value,
  onCommit,
  isValid = () => true,
}: UseInlineEditOptions<T>) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<T>(value);
  const [pending, setPending] = React.useState<{ value: T } | null>(null);
  // Enter and Escape close the editor; this stops the blur that follows from saving again.
  const isClosedRef = React.useRef(false);
  // Keyboard users get focus back on the cell after Enter or Escape.
  const shouldRefocusRef = React.useRef(false);

  const shown = pending ? pending.value : value;

  const startEdit = () => {
    isClosedRef.current = false;
    setDraft(shown);
    setIsEditing(true);
  };

  const close = (refocus: boolean) => {
    isClosedRef.current = true;
    shouldRefocusRef.current = refocus;
    setIsEditing(false);
  };

  const commit = async (refocus: boolean) => {
    if (isClosedRef.current) {
      return;
    }
    close(refocus);
    if (!isValid(draft) || Object.is(draft, value)) {
      return;
    }
    setPending({ value: draft });
    try {
      await onCommit(draft);
    } catch {
      // The caller already surfaced the error; showing the stored value again is the rollback.
    } finally {
      setPending(null);
    }
  };

  /** Spread onto the editor control. */
  const editorProps = {
    autoFocus: true,
    onBlur: () => {
      void commit(false);
    },
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        void commit(true);
      } else if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
    },
  };

  /** Ref for the at-rest button; restores focus after a keyboard save or cancel. */
  const displayRef = (element: HTMLButtonElement | null) => {
    if (element && shouldRefocusRef.current) {
      shouldRefocusRef.current = false;
      element.focus();
    }
  };

  return { isEditing, draft, setDraft, shown, startEdit, editorProps, displayRef };
}
