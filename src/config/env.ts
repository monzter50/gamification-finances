/**
 * Centralized, typed access to Vite environment variables.
 *
 * Vite loads files in this priority order (mode = `import.meta.env.MODE`):
 *   .env                 (always)
 *   .env.local           (always, gitignored)
 *   .env.[mode]          (e.g. .env.staging, committed)
 *   .env.[mode].local    (gitignored)
 *
 * Switch endpoints by selecting a mode at build/dev time:
 *   yarn dev               -> mode "development" -> .env.development
 *   yarn dev:staging       -> mode "staging"     -> .env.staging
 *   yarn build:staging     -> mode "staging"     -> .env.staging
 *   yarn build             -> mode "production"  -> .env.production
 */

export type AppEnv = "development" | "staging" | "production";

const requireEnv = (key: keyof ImportMetaEnv, fallback?: string): string => {
  const value = import.meta.env[key] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(
      `[env] Missing required environment variable: ${String(key)}. ` +
        `Make sure it is defined in the appropriate .env file for mode "${import.meta.env.MODE}".`,
    );
  }
  return value;
};

const parseBool = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  return value === "true" || value === "1";
};

export const env = {
  /** Vite mode: "development" | "staging" | "production" | custom */
  mode: import.meta.env.MODE,
  /** True only when `vite` dev server is running */
  isDev: import.meta.env.DEV,
  /** True only when bundle is built with `vite build` */
  isProd: import.meta.env.PROD,

  /** App-level environment label, independent of Vite's DEV/PROD flag */
  appEnv: (import.meta.env.VITE_APP_ENV ?? "development") as AppEnv,

  /** Base URL the API client should hit */
  apiBaseUrl: requireEnv("VITE_API_BASE_URL", "http://localhost:3000/api"),

  /** Whether to emit verbose client-side logs */
  enableDebugLogs: parseBool(
    import.meta.env.VITE_ENABLE_DEBUG_LOGS,
    import.meta.env.DEV,
  ),
} as const;

export const isStaging = env.appEnv === "staging";
export const isProduction = env.appEnv === "production";
