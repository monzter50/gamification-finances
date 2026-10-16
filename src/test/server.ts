import { setupServer } from "msw/node";

import { env } from "@/config/env";

/**
 * MSW server for tests — mock the NETWORK, never modules (CLAUDE.md).
 * Tests register handlers with `server.use(...)`; unhandled requests fail.
 */
export const server = setupServer();

/** Absolute URL for an API path, e.g. `api("/accounts")`. */
export const api = (path: string) => `${env.apiBaseUrl}${path}`;
