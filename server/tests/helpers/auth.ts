import request from "supertest";
import { app } from "../../src/app.js";

interface RegisterOptions {
  email?: string;
  password?: string;
}

let counter = 0;

export async function registerAndLogin(overrides: RegisterOptions = {}) {
  const agent = request.agent(app);
  counter += 1;
  const email = overrides.email ?? `test-user-${Date.now()}-${counter}@example.com`;
  const password = overrides.password ?? "password123";

  const res = await agent.post("/api/auth/register").send({ email, password });
  if (res.status !== 201) {
    throw new Error(`registerAndLogin failed: ${res.status} ${JSON.stringify(res.body)}`);
  }

  return { agent, user: res.body.user as { id: string; email: string }, email, password };
}
