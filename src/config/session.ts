/**
 * Single-active-session contract (frontend side).
 *
 * The backend signals session problems through the HTTP STATUS CODE, because
 * `@aglaya/api-core` throws an `ApiError` on any non-2xx response *before*
 * reading the JSON body — so the `errorCode` string in the body is unreachable
 * from the client. The status is the only reliable channel, hence the two
 * dedicated codes below.
 *
 * This is the ONE place the contract lives. Detection everywhere else goes
 * through `isSessionRevoked` / `isSessionAlreadyActive`.
 */
import { ApplicationError } from "@/utils/errors";

/** Mid-session: the token's session was superseded by a newer login elsewhere. */
export const SESSION_REVOKED_STATUS = 440;

/** At login: the account already has a session active within the inactivity window. */
export const SESSION_ALREADY_ACTIVE_STATUS = 409;

/** Reason a blocking screen is shown. */
export type SessionBlockReason = "revoked" | "already_active";

/** Pull an HTTP status off whatever error shape we were handed. */
const statusOf = (err: unknown): number | undefined => {
  if (err instanceof ApplicationError) { return err.statusCode; }
  if (err && typeof err === "object") {
    if ("statusCode" in err) { return Number((err as { statusCode: unknown }).statusCode); }
    if ("status" in err) { return Number((err as { status: unknown }).status); }
  }
  return undefined;
};

/** Mid-session revocation (handled globally via the event bus). */
export const isSessionRevoked = (err: unknown): boolean =>
  statusOf(err) === SESSION_REVOKED_STATUS;

/**
 * Login rejected because a session is already active. NOTE: 409 is only the
 * single-session signal in the LOGIN flow — register also uses 409 for
 * "email already taken", so only call this on errors from the login call.
 */
export const isSessionAlreadyActive = (err: unknown): boolean =>
  statusOf(err) === SESSION_ALREADY_ACTIVE_STATUS;
