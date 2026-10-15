#!/usr/bin/env node
/**
 * Pull the backend's OpenAPI contract into openapi/openapi.json.
 *
 * The backend commits its spec (api-gamification-finances/openapi-schema.json,
 * produced by `yarn export:schema`). This copies it here so that:
 *   - Orval generates from a committed file (deterministic, works offline)
 *   - every contract change shows up as a reviewable git diff
 *
 * Source resolution (first match wins):
 *   1. API_SPEC_SOURCE env var — a file path or an http(s) URL
 *   2. ../api-gamification-finances/openapi-schema.json (sibling checkout)
 *   3. GitHub: monzter50/api-gamification-finances@${API_SPEC_REF:-main}
 *      (needs API_SPEC_TOKEN / GITHUB_TOKEN / GH_TOKEN if the repo is private)
 *
 * Flags:
 *   --check   Don't write. Exit 1 if the source differs from the committed copy.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = resolve(ROOT, "openapi/openapi.json");
const SOURCE_META = resolve(ROOT, "openapi/source.json");
const SIBLING_REPO = resolve(ROOT, "../api-gamification-finances");
const SIBLING_SPEC = resolve(SIBLING_REPO, "openapi-schema.json");
const GITHUB_REPO = "monzter50/api-gamification-finances";
const SPEC_PATH_IN_REPO = "openapi-schema.json";

const checkOnly = process.argv.includes("--check");

const fail = (msg) => {
  process.stderr.write(`api:pull ✖ ${msg}\n`);
  process.exit(1);
};

const gitInfo = (repoDir) => {
  try {
    const run = (...args) =>
      execFileSync("git", ["-C", repoDir, ...args], { encoding: "utf8" }).trim();
    return {
      branch: run("rev-parse", "--abbrev-ref", "HEAD"),
      commit: run("rev-parse", "--short", "HEAD"),
      dirty: run("status", "--porcelain", "--", SPEC_PATH_IN_REPO) !== "",
    };
  } catch {
    return null;
  }
};

const fetchText = async (url, headers = {}) => {
  const res = await fetch(url, { headers });
  if (!res.ok) fail(`GET ${url} → ${res.status} ${res.statusText}`);
  return res.text();
};

const resolveSource = async () => {
  const explicit = process.env.API_SPEC_SOURCE;
  if (explicit) {
    if (/^https?:\/\//.test(explicit)) {
      return { text: await fetchText(explicit), meta: { source: explicit } };
    }
    const path = resolve(ROOT, explicit);
    if (!existsSync(path)) fail(`API_SPEC_SOURCE not found: ${path}`);
    return { text: readFileSync(path, "utf8"), meta: { source: explicit } };
  }

  if (existsSync(SIBLING_SPEC)) {
    const git = gitInfo(SIBLING_REPO);
    if (git && git.branch !== "main") {
      process.stderr.write(
        `api:pull ⚠ backend checkout is on "${git.branch}", not main — ` +
          `you're pulling an unreleased contract.\n`,
      );
    }
    if (git?.dirty) {
      process.stderr.write(`api:pull ⚠ backend ${SPEC_PATH_IN_REPO} has uncommitted changes.\n`);
    }
    return {
      text: readFileSync(SIBLING_SPEC, "utf8"),
      meta: {
        source: `${GITHUB_REPO}/${SPEC_PATH_IN_REPO}`,
        ref: git?.branch,
        commit: git?.commit,
      },
    };
  }

  const ref = process.env.API_SPEC_REF ?? "main";
  const token = process.env.API_SPEC_TOKEN ?? process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${SPEC_PATH_IN_REPO}?ref=${ref}`;
  const text = await fetchText(url, {
    Accept: "application/vnd.github.raw+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });
  return { text, meta: { source: `${GITHUB_REPO}/${SPEC_PATH_IN_REPO}`, ref } };
};

const { text, meta } = await resolveSource();

let spec;
try {
  spec = JSON.parse(text);
} catch (err) {
  fail(`source is not valid JSON: ${err.message}`);
}
if (typeof spec.openapi !== "string" || !spec.openapi.startsWith("3.")) {
  fail(`source is not an OpenAPI 3.x document (openapi: ${spec.openapi})`);
}
if (!spec.paths || typeof spec.paths !== "object") fail("source has no `paths`");

// Normalized formatting so diffs only reflect contract changes, not whitespace.
const normalized = `${JSON.stringify(spec, null, 2)}\n`;
const current = existsSync(TARGET) ? readFileSync(TARGET, "utf8") : "";
const opCount = Object.values(spec.paths).reduce((n, item) => n + Object.keys(item).length, 0);

if (checkOnly) {
  if (normalized === current) {
    process.stdout.write(
      `api:pull ✔ committed contract matches ${meta.source}${meta.ref ? `@${meta.ref}` : ""}\n`,
    );
    process.exit(0);
  }
  fail(
    `openapi/openapi.json is out of date with ${meta.source}` +
      `${meta.ref ? `@${meta.ref}` : ""}. Run: npm run api:sync`,
  );
}

mkdirSync(dirname(TARGET), { recursive: true });
writeFileSync(TARGET, normalized);
writeFileSync(SOURCE_META, `${JSON.stringify(meta, null, 2)}\n`);

const changed = normalized !== current;
process.stdout.write(
  `api:pull ✔ ${changed ? "updated" : "unchanged"} openapi/openapi.json ` +
    `(${Object.keys(spec.paths).length} paths, ${opCount} operations) ← ${meta.source}` +
    `${meta.ref ? `@${meta.ref}` : ""}${meta.commit ? ` (${meta.commit})` : ""}\n`,
);
