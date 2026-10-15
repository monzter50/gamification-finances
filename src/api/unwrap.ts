import { AppError } from "@/shared/errors";

/**
 * Generated functions resolve to Orval's `{ status, data, headers }` union.
 * Non-2xx never reaches here — the mutator already threw an AppError — so we
 * narrow to the 2xx arm and hand feature code the response BODY.
 */
type SuccessArm<T> = Extract<T, { status: 200 | 201 | 204 }>;
type Body<T> = SuccessArm<T> extends { data: infer B } ? B : never;

/** The full response body — use for paginated responses (`data` + `pagination`). */
export const unwrap = async <T extends { status: number; data: unknown }>(
  res: Promise<T>,
): Promise<Body<T>> => (await res).data as Body<T>;

/**
 * The `data` field of the standard envelope `{ success, data, message }`.
 * Throws if the server omitted it, so callers get a non-optional value.
 */
export const unwrapData = async <T extends { status: number; data: unknown }>(
  res: Promise<T>,
): Promise<NonNullable<Body<T> extends { data?: infer D } ? D : never>> => {
  const body = (await unwrap(res)) as { data?: unknown } | undefined;
  if (body?.data == null) {
    throw new AppError({ message: "Response envelope has no `data`", kind: "server" });
  }
  return body.data as NonNullable<Body<T> extends { data?: infer D } ? D : never>;
};
