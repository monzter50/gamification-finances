import { AlertTriangle, Lock, RotateCw, SearchX, WifiOff } from "lucide-react";
import type { ReactNode } from "react";

import { Button, ErrorState } from "@/components/ui";
import type { ErrorKind } from "@/shared/errors/AppError";
import { toUserMessage, toUserTitle } from "@/shared/errors/messages";
import { normalizeError } from "@/shared/errors/normalize";

export interface ErrorPanelProps {
  error: unknown;
  /** Shows a "Try again" button for retryable errors (network / 5xx / 429). */
  onRetry?: () => void;
  /** Override the heading, e.g. "Couldn't load transactions". */
  title?: string;
  size?: "default" | "compact";
  className?: string;
}

const ICONS: Partial<Record<ErrorKind, ReactNode>> = {
  network: <WifiOff />,
  not_found: <SearchX />,
  forbidden: <Lock />,
  unauthorized: <Lock />,
};

// TODO(i18n): button label
const RETRY_LABEL = "Try again";

/**
 * Inline error for a section that failed to load. Maps any error to the right
 * copy + icon, and only offers retry when retrying can actually help.
 *
 *   if (query.isError) return <ErrorPanel error={query.error} onRetry={query.refetch} />;
 */
export const ErrorPanel = ({ error, onRetry, title, size, className }: ErrorPanelProps) => {
  const e = normalizeError(error);
  const canRetry =
    onRetry != null && (e.isRetryable || e.kind === "client" || e.kind === "unknown");

  return (
    <ErrorState
      size={size}
      className={className}
      icon={ICONS[e.kind] ?? <AlertTriangle />}
      title={title ?? toUserTitle(e)}
      description={toUserMessage(e)}
      action={
        canRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCw aria-hidden="true" />
            {RETRY_LABEL}
          </Button>
        ) : undefined
      }
    />
  );
};
