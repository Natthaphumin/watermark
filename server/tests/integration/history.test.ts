import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "../helpers/db.js";
import { registerAndLogin } from "../helpers/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, "../fixtures");

beforeEach(async () => {
  await resetDb();
});

describe("history", () => {
  it("uploads a thumbnail, lists it, then deletes it", async () => {
    const { agent } = await registerAndLogin();

    const upload = await agent
      .post("/api/history")
      .attach("file", path.join(fixturesDir, "logo.png"));
    expect(upload.status).toBe(201);
    const itemId = upload.body.item.id as string;

    const list = await agent.get("/api/history?page=1");
    expect(list.status).toBe(200);
    expect(list.body.items).toHaveLength(1);
    expect(list.body.page).toBe(1);

    const del = await agent.delete(`/api/history/${itemId}`);
    expect(del.status).toBe(204);

    const listAfter = await agent.get("/api/history?page=1");
    expect(listAfter.body.items).toHaveLength(0);
  });

  it("only returns the authenticated user's own history", async () => {
    const owner = await registerAndLogin();
    const stranger = await registerAndLogin();

    await owner.agent.post("/api/history").attach("file", path.join(fixturesDir, "logo.png"));

    const strangerList = await stranger.agent.get("/api/history?page=1");
    expect(strangerList.body.items).toHaveLength(0);
  });

  it("404s when deleting another user's history item", async () => {
    const owner = await registerAndLogin();
    const stranger = await registerAndLogin();

    const upload = await owner.agent
      .post("/api/history")
      .attach("file", path.join(fixturesDir, "logo.png"));
    const itemId = upload.body.item.id as string;

    const res = await stranger.agent.delete(`/api/history/${itemId}`);
    expect(res.status).toBe(404);
  });
});
