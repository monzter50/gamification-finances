import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * PageHeader — top of every page. Enforces consistent spacing/typography
 * so feature pages don't reinvent layouts.
 *
 *   <PageHeader
 *     title="Transactions"
 *     description="All income and expenses across accounts"
 *     actions={<Button>New transaction</Button>}
 *   />
 */

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Optional breadcrumb/tabs/filter row rendered below the title. */
  toolbar?: React.ReactNode;
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, description, actions, toolbar, className, ...rest }, ref) => (
    <header ref={ref} className={cn("mb-6 space-y-4", className)} {...rest}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-display-sm font-semibold tracking-tight text-foreground">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {toolbar ? <div>{toolbar}</div> : null}
    </header>
  ),
);
PageHeader.displayName = "PageHeader";
