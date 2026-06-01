/**
 * Framework-free pub/sub for "this session was revoked mid-flight".
 *
 * The detection point is the Orval mutator (not a React component), so it can't
 * touch React context directly. It calls `notifySessionRevoked()`; AuthContext
 * subscribes and reacts. The internal `revoked` guard makes concurrent 401/440s
 * fire the handler exactly once (no double-clears, no loops).
 */
let revoked = false;
const listeners = new Set<() => void>();

/** Signal that the current session has been revoked. Idempotent until reset. */
export const notifySessionRevoked = (): void => {
  if (revoked) { return; }
  revoked = true;
  listeners.forEach((listener) => { listener(); });
};

/** Subscribe to revocation. Returns an unsubscribe function. */
export const subscribeSessionRevoked = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

/** Re-arm the guard after the user acknowledges the blocking screen. */
export const resetSessionRevoked = (): void => {
  revoked = false;
};
