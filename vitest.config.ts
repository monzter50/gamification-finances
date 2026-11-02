import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config";

// Reuses vite.config.ts (aliases, define) so tests resolve "@/…" like the app.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.test.{ts,tsx}"],
      exclude: ["**/node_modules/**", "**/._*"],
      restoreMocks: true,
      unstubGlobals: true,
      // Node ≥ 25 ships a global `localStorage` (Web Storage) that shadows
      // jsdom's and has no methods without --localstorage-file. Turn it off.
      poolOptions: { forks: { execArgv: ["--no-experimental-webstorage"] } },
    },
  }),
);
