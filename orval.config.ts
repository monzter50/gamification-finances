import { defineConfig } from "orval";

/**
 * Orval generates a typed API client from the backend's OpenAPI spec.
 *
 *   npm run api:gen
 *
 * Source of truth: the live /api-docs.json endpoint served by the backend.
 * If the backend is offline, swap `input` to a committed ./openapi.json snapshot.
 *
 * Output convention:
 *   src/api/generated/index.ts          — barrel re-export
 *   src/api/generated/<tag>/<tag>.ts    — one file per OpenAPI tag (Income, Expense, …)
 *   src/api/generated/models/*.ts       — DTOs / response shapes
 *
 * Every generated function is routed through src/api/orval-mutator.ts so
 * auth headers, the ApiResponse envelope, and error normalization stay in
 * one place.
 */
export default defineConfig({
  api: {
    input: {
      target: "http://localhost:3000/api-docs.json",
    },
    output: {
      mode:       "tags-split",
      target:     "./src/api/generated/index.ts",
      schemas:    "./src/api/generated/models",
      client:     "fetch",
      httpClient: "fetch",
      clean:      true,           // wipe stale files before each gen so renames don't leave orphans
      prettier:   false,          // ESLint --fix handles formatting (see hooks below)
      override:   {
        mutator: {
          path: "./src/api/orval-mutator.ts",
          name: "customInstance",
        },
      },
    },
    hooks: {
      afterAllFilesWrite: "eslint --fix ./src/api/generated",
    },
  },
});
