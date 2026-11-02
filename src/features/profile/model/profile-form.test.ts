import { describe, expect, it } from "vitest";

import { toProfileChanges } from "@/features/profile/model/profile-form";

const profile = { name: "Ana", savingsGoal: 10000 };

describe("toProfileChanges", () => {
  it("returns null when nothing changed", () => {
    expect(toProfileChanges(profile, { name: " Ana ", savingsGoal: "10000" })).toBeNull();
  });

  it("sends only the changed fields, trimmed", () => {
    expect(toProfileChanges(profile, { name: "  Ana María ", savingsGoal: "10000" })).toEqual({
      name: "Ana María",
    });
    expect(toProfileChanges(profile, { name: "Ana", savingsGoal: "15000" })).toEqual({
      savingsGoal: 15000,
    });
  });

  it("never sends a blank name or a non-numeric goal", () => {
    expect(toProfileChanges(profile, { name: "  ", savingsGoal: "abc" })).toBeNull();
  });
});
