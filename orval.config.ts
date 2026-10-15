import { defineConfig } from "orval";

/**
 * Orval generates a typed API client from the backend's OpenAPI spec.
 *
 *   npm run api:gen
 *
 * Source of truth: openapi/openapi.json — a committed copy of the backend's
 * openapi-schema.json. Refresh it with `npm run api:pull` (or `api:sync` to
 * pull + generate). Never point this at a live server: generation must be
 * deterministic so CI (`npm run api:check`) can verify the committed client.
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
      target: "./openapi/openapi.json",
    },
    output: {
      mode: "tags-split",
      target: "./src/api/generated/index.ts",
      schemas: "./src/api/generated/models",
      client: "fetch",
      httpClient: "fetch",
      clean: true, // wipe stale files before each gen so renames don't leave orphans
      prettier: false, // `npm run api:gen` runs prettier after the eslint --fix hook
      override: {
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
