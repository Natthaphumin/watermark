import { describe, expect, it } from "vitest";
import { signAuthToken, verifyAuthToken } from "../../src/lib/jwt.js";

describe("jwt", () => {
  it("signs a token that verifies back to the same user id", () => {
    const token = signAuthToken("user-123");
    const payload = verifyAuthToken(token);
    expect(payload.sub).toBe("user-123");
  });

  it("throws when verifying a malformed token", () => {
    expect(() => verifyAuthToken("not-a-real-token")).toThrow();
  });
});
