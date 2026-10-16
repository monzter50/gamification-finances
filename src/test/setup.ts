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
