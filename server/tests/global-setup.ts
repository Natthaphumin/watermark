import { execSync } from "node:child_process";
import { config } from "dotenv";
import { Client } from "pg";

config({ path: ".env.test" });

const TEST_DB_NAME = "watermark_test";

function adminUrl(databaseUrl: string): string {
  const url = new URL(databaseUrl);
  url.pathname = "/watermark";
  return url.toString();
}

export async function setup() {
  const testUrl = process.env.DATABASE_URL!;
  const client = new Client({ connectionString: adminUrl(testUrl) });
  await client.connect();
  try {
    await client.query(`CREATE DATABASE ${TEST_DB_NAME}`);
  } catch (err) {
    const pgErr = err as { code?: string };
    if (pgErr.code !== "42P04") throw err; // 42P04 = database already exists
  } finally {
    await client.end();
  }

  execSync("npx prisma migrate deploy", {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: testUrl },
    stdio: "inherit",
  });
}
