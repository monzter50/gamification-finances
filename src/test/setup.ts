import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "@/test/server";

/*
 * jsdom replaces the global AbortSignal, but fetch stays Node's (undici), which
 * rejects jsdom signals ("Expected signal to be an instance of AbortSignal").
 * The Orval mutator passes `AbortSignal.timeout(...)` to fetch; tests don't need
 * request timeouts (MSW answers synchronously), so hand fetch no signal at all.
 * Production code is untouched.
 */
AbortSignal.timeout = (() => undefined) as unknown as typeof AbortSignal.timeout;

/*
 * Same mismatch, from React Router: a data router builds a `Request` with a
 * jsdom signal on every navigation (e.g. a <Navigate> redirect), which Node's
 * Request rejects. Drop the signal — tests never abort navigations.
 */
const NodeRequest = globalThis.Request;
globalThis.Request = class extends NodeRequest {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(input, init && { ...init, signal: undefined });
  }
} as typeof Request;

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());

// jsdom has no matchMedia (the theme reads prefers-color-scheme). Light, no listeners.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
