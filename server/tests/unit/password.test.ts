import { describe, expect, it } from "vitest";
import { comparePassword, hashPassword } from "../../src/lib/password.js";

describe("password hashing", () => {
  it("hashes a password and verifies the correct plaintext against it", async () => {
    const hash = await hashPassword("password123");
    expect(hash).not.toBe("password123");
    await expect(comparePassword("password123", hash)).resolves.toBe(true);
  });

  it("rejects an incorrect plaintext", async () => {
    const hash = await hashPassword("password123");
    await expect(comparePassword("wrong-password", hash)).resolves.toBe(false);
  });
});
