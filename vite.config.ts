import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import pkg from "./package.json";

// The deployed commit SHA: VITE_GIT_SHA when CI passes it explicitly, else the
// one Vercel sets on every build (system env var), else "dev" for local builds.
/* eslint-disable turbo/no-undeclared-env-vars -- build-time env, not a turbo task input */
const commitSha = process.env.VITE_GIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "dev";
/* eslint-enable turbo/no-undeclared-env-vars */

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        parserOpts: {
          plugins: ["decorators-legacy"],
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Build-time globals — reach via `__APP_VERSION__` / `__APP_COMMIT__`
  // in app code. Declared as `string` in src/vite-env.d.ts.
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_COMMIT__: JSON.stringify(commitSha),
  },
});
