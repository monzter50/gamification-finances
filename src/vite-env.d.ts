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
