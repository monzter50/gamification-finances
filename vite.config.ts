import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import pkg from "./package.json";

// Resolve the deployed commit SHA. CI passes it in via VITE_GIT_SHA
// (e.g. `${{ github.sha }}` in the build workflow). Locally it falls back
// to "dev" so we don't break dev builds.
const commitSha = process.env.VITE_GIT_SHA ?? "dev";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        parserOpts: {
          plugins: [ "decorators-legacy" ],
        },
      },
    })
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
    __APP_COMMIT__:  JSON.stringify(commitSha),
  },
});
