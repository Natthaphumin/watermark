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

async function uploadLogo(agent: Awaited<ReturnType<typeof registerAndLogin>>["agent"]) {
  const res = await agent.post("/api/logos").attach("file", path.join(fixturesDir, "logo.png"));
  return res.body.logo.id as string;
}

describe("presets", () => {
  it("creates a text-only preset", async () => {
    const { agent } = await registerAndLogin();

    const res = await agent
      .post("/api/presets")
      .send({ name: "text-only", textContent: "hello" });

    expect(res.status).toBe(201);
    expect(res.body.preset.textContent).toBe("hello");
    expect(res.body.preset.logoId).toBeNull();
  });

  it("creates a logo-only preset", async () => {
    const { agent } = await registerAndLogin();
    const logoId = await uploadLogo(agent);

    const res = await agent.post("/api/presets").send({ name: "logo-only", logoId });

    expect(res.status).toBe(201);
    expect(res.body.preset.logoId).toBe(logoId);
  });

  it("creates a preset with both text and logo", async () => {
    const { agent } = await registerAndLogin();
    const logoId = await uploadLogo(agent);

    const res = await agent
      .post("/api/presets")
      .send({ name: "both", textContent: "hi", logoId });

    expect(res.status).toBe(201);
    expect(res.body.preset.textContent).toBe("hi");
    expect(res.body.preset.logoId).toBe(logoId);
  });

  it("rejects a preset with neither text nor logo", async () => {
    const { agent } = await registerAndLogin();

    const res = await agent.post("/api/presets").send({ name: "empty" });

    expect(res.status).toBe(400);
  });

  it("rejects a logoId that doesn't belong to the user", async () => {
    const owner = await registerAndLogin();
    const stranger = await registerAndLogin();
    const logoId = await uploadLogo(owner.agent);

    const res = await stranger.agent.post("/api/presets").send({ name: "stolen-logo", logoId });

    expect(res.status).toBe(400);
  });

  it("404s when reading/updating/deleting another user's preset", async () => {
    const owner = await registerAndLogin();
    const stranger = await registerAndLogin();

    const created = await owner.agent
      .post("/api/presets")
      .send({ name: "mine", textContent: "hello" });
    const presetId = created.body.preset.id as string;

    const get = await stranger.agent.get(`/api/presets/${presetId}`);
    expect(get.status).toBe(404);

    const put = await stranger.agent
      .put(`/api/presets/${presetId}`)
      .send({ name: "mine", textContent: "hijacked" });
    expect(put.status).toBe(404);

    const del = await stranger.agent.delete(`/api/presets/${presetId}`);
    expect(del.status).toBe(404);
  });

  it("clears logoId on a preset when the referenced logo is deleted", async () => {
    const { agent } = await registerAndLogin();
    const logoId = await uploadLogo(agent);

    const created = await agent
      .post("/api/presets")
      .send({ name: "logo-only", logoId });
    const presetId = created.body.preset.id as string;

    const del = await agent.delete(`/api/logos/${logoId}`);
    expect(del.status).toBe(204);

    const refetched = await agent.get(`/api/presets/${presetId}`);
    expect(refetched.status).toBe(200);
    expect(refetched.body.preset.logoId).toBeNull();
  });
});
