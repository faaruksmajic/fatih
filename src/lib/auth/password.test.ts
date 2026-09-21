import { describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { verifyPassword } from "./password";

describe("verifyPassword", () => {
  const hash = bcrypt.hashSync("correct-horse-battery-staple", 10);

  it("returns true for the matching password", async () => {
    expect(await verifyPassword("correct-horse-battery-staple", hash)).toBe(true);
  });

  it("returns false for a wrong password", async () => {
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });
});
