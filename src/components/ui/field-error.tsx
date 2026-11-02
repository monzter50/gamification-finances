import { cn } from "@/lib/utils";

export interface FieldErrorProps {
  /** Point the control's `aria-describedby` at this id. */
  id: string;
  /** Nothing renders when empty. */
  message?: string;
  className?: string;
}

/** Inline form error under a field, styled per the design system's form rules. */
export const FieldError = ({ id, message, className }: FieldErrorProps) =>
  message ? (
    <p id={id} className={cn("mt-1 text-sm text-danger", className)}>
      {message}
    </p>
  ) : null;
