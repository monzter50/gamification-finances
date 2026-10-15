import { normalizeError, toUserMessage } from "@/shared/errors";

export interface ErrorToastCopy {
  title: string;
  description: string;
}

// TODO(i18n)
/**
 * Toast copy for a failed "duplicate budget". Branches on the backend
 * `errorCode` (never on message text). `targetLabel` is e.g. "May 2026".
 */
export const duplicateBudgetErrorCopy = (error: unknown, targetLabel: string): ErrorToastCopy => {
  const e = normalizeError(error);

  switch (e.code) {
    case "BUDGET_ALREADY_EXISTS":
      return {
        title: `${targetLabel} is already taken`,
        description: "You already have a budget for that period. Open or delete it first.",
      };
    case "STALE_ACCOUNT_REFERENCES":
      // Backend message lists the offending account ids — that's the actionable part.
      return { title: "Source has stale account references", description: toUserMessage(e) };
    case "BUDGET_NOT_FOUND":
      // Also returned for another user's budget (backend hides ownership behind 404).
      return { title: "Source budget missing", description: toUserMessage(e) };
  }

  if (e.kind === "validation") {
    return { title: "Invalid year or month", description: toUserMessage(e) };
  }
  return { title: "Duplicate failed", description: toUserMessage(e) };
};
