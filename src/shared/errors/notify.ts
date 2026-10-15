import { toast } from "@/hooks/use-toast";
import type { AppError } from "@/shared/errors/AppError";
import { toUserMessage, toUserTitle } from "@/shared/errors/messages";
import { reportError, type ErrorContext } from "@/shared/errors/report";

export interface NotifyErrorOptions {
  /** Override the heading ("Couldn't save budget"). Defaults to the error kind's title. */
  title?: string;
  /** Override the body text. Defaults to `toUserMessage(error)`. */
  description?: string;
  context?: ErrorContext;
}

/** Same text within this window = one toast (e.g. 5 parallel requests failing offline). */
const DEDUPE_MS = 3000;
const recent = new Map<string, number>();

const isDuplicate = (key: string, now: number): boolean => {
  for (const [k, at] of recent) {
    if (now - at > DEDUPE_MS) recent.delete(k);
  }
  if (recent.has(key)) return true;
  recent.set(key, now);
  return false;
};

/**
 * Report an error AND tell the user with a toast. Use for failures of
 * user-initiated actions (save, delete, import) when there is no better
 * place to show it inline.
 *
 * Skips `session` errors — SessionBlockedGate already shows a blocking screen.
 * Returns the normalized error for further branching.
 *
 *   } catch (err) {
 *     notifyError(err, { title: "Couldn't save budget", context: { source: "budget.save" } });
 *   }
 */
export const notifyError = (error: unknown, options: NotifyErrorOptions = {}): AppError => {
  const appError = reportError(error, options.context);
  if (appError.kind === "session") return appError;

  const title = options.title ?? toUserTitle(appError);
  const description = options.description ?? toUserMessage(appError);
  if (isDuplicate(`${title}|${description}`, Date.now())) return appError;

  toast({ variant: "destructive", title, description });
  return appError;
};
