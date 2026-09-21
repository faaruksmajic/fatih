import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "./session";

const SECRET = "test-secret-at-least-32-bytes-long!!";

describe("session tokens", () => {
  it("round-trips a valid token", async () => {
    const token = await createSessionToken({ email: "admin@example.com" }, SECRET);
    const session = await verifySessionToken(token, SECRET);
    expect(session).toEqual({ email: "admin@example.com" });
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken({ email: "admin@example.com" }, SECRET);
    const session = await verifySessionToken(token, "a-completely-different-secret!!");
    expect(session).toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await createSessionToken({ email: "admin@example.com" }, SECRET, -10);
    const session = await verifySessionToken(token, SECRET);
    expect(session).toBeNull();
  });

  it("rejects garbage input", async () => {
    const session = await verifySessionToken("not-a-real-token", SECRET);
    expect(session).toBeNull();
  });
});
