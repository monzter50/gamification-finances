import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * ErrorState — the failed-to-load counterpart of EmptyState. Render it where
 * the content would have been (a card, a table body, a page section), never a
 * blank area or a raw error string.
 *
 * Presentational only: pass already-user-facing text. For an `unknown` error
 * object use `<ErrorPanel error={err} />` from `@/shared/errors`, which picks
 * the copy and icon for you.
 */
export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Usually a "Try again" <Button>. */
  action?: React.ReactNode;
  /** `compact` for table rows / small tiles. */
  size?: "default" | "compact";
}

export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ icon, title, description, action, size = "default", className, ...rest }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-lg border border-danger/30 bg-danger-subtle/40",
        size === "compact" ? "py-6 px-4" : "py-12 px-6",
        className,
      )}
      {...rest}
    >
      {icon ? (
        <div
          aria-hidden="true"
          className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-danger-subtle text-danger"
        >
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  ),
);
ErrorState.displayName = "ErrorState";
