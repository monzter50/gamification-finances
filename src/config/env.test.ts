import { describe, expect, it } from "vitest";

import { buildLabel, env } from "@/config/env";

describe("buildLabel", () => {
  it("shows the version and the short commit SHA", () => {
    expect(buildLabel("0.3.0", "1a2b3c4d5e6f7890")).toBe("v0.3.0 · 1a2b3c4");
  });

  it("says 'dev' for local builds", () => {
    expect(buildLabel("0.3.0", "dev")).toBe("v0.3.0 · dev");
  });

  it("gets a semver version and a commit injected at build time", () => {
    expect(env.appVersion).toMatch(/^\d+\.\d+\.\d+/);
    expect(env.appCommit).not.toBe("");
  });
});
