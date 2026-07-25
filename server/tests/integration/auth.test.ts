import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../../src/app.js";
import { resetDb } from "../helpers/db.js";
import { registerAndLogin } from "../helpers/auth.js";

beforeEach(async () => {
  await resetDb();
});

describe("auth", () => {
  it("registers a new user and sets a session cookie", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "alice@example.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("alice@example.com");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("rejects registering the same email twice", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "dup@example.com", password: "password123" });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "dup@example.com", password: "password123" });

    expect(res.status).toBe(409);
  });

  it("logs in with correct credentials and rejects wrong password", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "bob@example.com", password: "password123" });

    const good = await request(app)
      .post("/api/auth/login")
      .send({ email: "bob@example.com", password: "password123" });
    expect(good.status).toBe(200);

    const bad = await request(app)
      .post("/api/auth/login")
      .send({ email: "bob@example.com", password: "wrong-password" });
    expect(bad.status).toBe(401);
  });

  it("returns the current user for /me when authenticated, 401 otherwise", async () => {
    const { agent, email } = await registerAndLogin();

    const authed = await agent.get("/api/auth/me");
    expect(authed.status).toBe(200);
    expect(authed.body.user.email).toBe(email);

    const anon = await request(app).get("/api/auth/me");
    expect(anon.status).toBe(401);
  });

  it("clears the session on logout", async () => {
    const { agent } = await registerAndLogin();

    const logout = await agent.post("/api/auth/logout");
    expect(logout.status).toBe(204);

    const me = await agent.get("/api/auth/me");
    expect(me.status).toBe(401);
  });
});
