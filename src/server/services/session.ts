import { createHash } from "node:crypto";
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

export async function enforceLoginLimit(
  db: PrismaClient,
  ip: string,
  email: string,
) {
  const windowStart = new Date(Math.floor(Date.now() / 900000) * 900000);
  for (const key of [
    `ip:${ip}`,
    `login:${createHash("sha256").update(email.toLowerCase()).digest("hex")}`,
  ]) {
    const counter = await db.rateLimitCounter.upsert({
      where: { key_windowStart: { key, windowStart } },
      create: { key, windowStart, count: 1 },
      update: { count: { increment: 1 } },
    });
    if (counter.count > (key.startsWith("ip:") ? 30 : 10))
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Muitas tentativas. Aguarde 15 minutos.",
      });
  }
  await db.rateLimitCounter.deleteMany({
    where: { windowStart: { lt: new Date(Date.now() - 86400000) } },
  });
}
export async function checkDatabase(db: PrismaClient) {
  await db.$queryRaw`SELECT 1`;
  return { status: "ok" as const, database: "conectado" as const };
}
