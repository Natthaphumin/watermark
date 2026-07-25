import path from "node:path";
import { fileURLToPath } from "node:url";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../../src/app.js";
import { resetDb } from "../helpers/db.js";
import { registerAndLogin } from "../helpers/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, "../fixtures");

beforeEach(async () => {
  await resetDb();
});

describe("logos", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/api/logos");
    expect(res.status).toBe(401);
  });

  it("uploads a PNG, lists it, and serves the file", async () => {
    const { agent } = await registerAndLogin();

    const upload = await agent
      .post("/api/logos")
      .attach("file", path.join(fixturesDir, "logo.png"));

    expect(upload.status).toBe(201);
    expect(upload.body.logo.url).toMatch(/^\/uploads\/logos\/.+\.png$/);

    const list = await agent.get("/api/logos");
    expect(list.status).toBe(200);
    expect(list.body.logos).toHaveLength(1);

    const file = await request(app).get(upload.body.logo.url);
    expect(file.status).toBe(200);
    expect(file.headers["content-type"]).toBe("image/png");
  });

  it("rejects non-PNG uploads", async () => {
    const { agent } = await registerAndLogin();

    const res = await agent
      .post("/api/logos")
      .attach("file", path.join(fixturesDir, "not-a-logo.txt"));

    expect(res.status).toBe(400);
  });

  it("deletes a logo it owns, but 404s for another user's logo", async () => {
    const owner = await registerAndLogin();
    const stranger = await registerAndLogin();

    const upload = await owner.agent
      .post("/api/logos")
      .attach("file", path.join(fixturesDir, "logo.png"));
    const logoId = upload.body.logo.id as string;

    const strangerDelete = await stranger.agent.delete(`/api/logos/${logoId}`);
    expect(strangerDelete.status).toBe(404);

    const ownerDelete = await owner.agent.delete(`/api/logos/${logoId}`);
    expect(ownerDelete.status).toBe(204);

    const list = await owner.agent.get("/api/logos");
    expect(list.body.logos).toHaveLength(0);
  });
});
