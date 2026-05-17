import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * EmptyState — every list, table, and panel should render one of these
 * instead of a blank area. Always include at least a title + action.
 */

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className, ...rest }, ref) => (
    <div
      ref={ref}
      role="status"
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-6 rounded-lg border border-dashed bg-muted/30",
        className,
      )}
      {...rest}
    >
      {icon ? (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
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
EmptyState.displayName = "EmptyState";
