/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API endpoint the SPA talks to */
  readonly VITE_API_BASE_URL: string;
  /** Logical environment label: "development" | "staging" | "production" */
  readonly VITE_APP_ENV: "development" | "staging" | "production";
  /** "true" | "false" — toggles verbose client logging */
  readonly VITE_ENABLE_DEBUG_LOGS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Build-time globals injected by Vite's `define` (see vite.config.ts).
// `__APP_VERSION__` mirrors package.json::version (kept in sync by
// release-please). `__APP_COMMIT__` is the deploy's git SHA (VITE_GIT_SHA,
// else Vercel's VERCEL_GIT_COMMIT_SHA), or "dev" for local builds.
// Read them through `env.appVersion` / `env.appCommit` (src/config/env.ts).
declare const __APP_VERSION__: string;
declare const __APP_COMMIT__: string;
