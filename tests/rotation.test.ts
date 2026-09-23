import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getNextCitizenEmail } from "../src/lib/rotation";
import type { UserProfile } from "../src/types";

const users: UserProfile[] = [
  { name: "Mayor", email: "mayor@example.com", role: "Mayor", points: 0, completedCount: 0, transferCount: 0, suiteCode: "ROOM1" },
  { name: "Ali", email: "ali@example.com", role: "Citizen", points: 10, completedCount: 1, transferCount: 0, suiteCode: "ROOM1" },
  { name: "Sara", email: "sara@example.com", role: "Citizen", points: 20, completedCount: 2, transferCount: 0, suiteCode: "ROOM1" },
  { name: "Reza", email: "reza@example.com", role: "Citizen", points: 30, completedCount: 3, transferCount: 0, suiteCode: "ROOM1" },
];

describe("getNextCitizenEmail", () => {
  it("advances to the next citizen and skips the mayor", () => {
    assert.equal(getNextCitizenEmail(users, "ali@example.com"), "sara@example.com");
  });

  it("wraps the last citizen back to the first citizen", () => {
    assert.equal(getNextCitizenEmail(users, "reza@example.com"), "ali@example.com");
  });

  it("matches email addresses case-insensitively", () => {
    assert.equal(getNextCitizenEmail(users, "SARA@EXAMPLE.COM"), "reza@example.com");
  });

  it("uses the first citizen when the saved turn is invalid", () => {
    assert.equal(getNextCitizenEmail(users, "missing@example.com"), "ali@example.com");
  });

  it("returns the only citizen instead of preserving an invalid email", () => {
    assert.equal(getNextCitizenEmail([users[0], users[2]], "missing@example.com"), "sara@example.com");
  });

  it("preserves the current value when no citizens exist", () => {
    assert.equal(getNextCitizenEmail([users[0]], "pending@example.com"), "pending@example.com");
  });
});
