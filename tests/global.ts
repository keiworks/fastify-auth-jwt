import { execSync } from "node:child_process";
import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";

async function setup(): Promise<void> {
  const dbPath = fileURLToPath(new URL("../database.test.db", import.meta.url));
  const db1 = rm(dbPath, { force: true });
  const db2 = rm(`${dbPath}-journal`, { force: true });
  await Promise.all([db1, db2]);
  execSync("pnpm prisma migrate dev");
}

export { setup };
