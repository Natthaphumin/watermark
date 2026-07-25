import { prisma } from "../../src/lib/prisma.js";

export async function resetDb() {
  await prisma.$transaction([
    prisma.historyItem.deleteMany(),
    prisma.preset.deleteMany(),
    prisma.logo.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}
