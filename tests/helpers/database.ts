import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { PrismaClient } from "@prisma/client";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { appRouter } from "../../src/server/api/root";
import type { Context } from "../../src/server/api/trpc";
import type { Identity } from "../../src/server/auth";

export async function startDatabase() {
  const container: StartedPostgreSqlContainer = await new PostgreSqlContainer(
    "postgres:16",
  )
    .withDatabase("empresti_test")
    .withUsername("test")
    .withPassword("test")
    .start();
  const url = container.getConnectionUri();
  execFileSync(
    process.execPath,
    [resolve("node_modules/prisma/build/index.js"), "migrate", "deploy"],
    {
      env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url },
      stdio: "pipe",
    },
  );
  const db = new PrismaClient({ datasourceUrl: url });
  return {
    db,
    container,
    url,
    stop: async () => {
      await db.$disconnect();
      await container.stop();
    },
  };
}
export async function fixtures(db: PrismaClient) {
  await db.$executeRawUnsafe(
    'TRUNCATE "audit_logs", "loans", "equipments", "memberships", "users", "tenants", "rate_limit_counters" CASCADE',
  );
  const tenant = await db.tenant.create({
    data: { slug: "suporte_ti", name: "Suporte de TI" },
  });
  const otherTenant = await db.tenant.create({
    data: { slug: "outro", name: "Outro tenant" },
  });
  const user = await db.user.create({
    data: {
      name: "Marina Alves",
      email: "marina@example.test",
      authUserId: randomUUID(),
      department: "Design",
    },
  });
  const otherUser = await db.user.create({
    data: {
      name: "Camila Duarte",
      email: "camila@example.test",
      authUserId: randomUUID(),
    },
  });
  await db.membership.createMany({
    data: [
      { tenantId: tenant.id, userId: user.id, role: "MEMBER" },
      { tenantId: otherTenant.id, userId: otherUser.id, role: "MEMBER" },
    ],
  });
  const identity: Identity = {
    ...user,
    tenantId: tenant.id,
    tenantName: tenant.name,
    role: "MEMBER",
  };
  const otherIdentity: Identity = {
    ...otherUser,
    tenantId: otherTenant.id,
    tenantName: otherTenant.name,
    role: "MEMBER",
  };
  const context = (who: Identity | null): Context => ({
    prisma: db,
    identity: who,
    auth: null,
    requestId: randomUUID(),
    ip: "127.0.0.1",
  });
  const equipment = await db.equipment.create({
    data: {
      name: 'MacBook Pro 14"',
      patrimony: "PAT-1042",
      category: "NOTEBOOK",
      tenantId: tenant.id,
      location: "Balcão · 2º andar",
    },
  });
  return {
    tenant,
    otherTenant,
    user,
    otherUser,
    identity,
    otherIdentity,
    equipment,
    context,
    caller: appRouter.createCaller(context(identity)),
    other: appRouter.createCaller(context(otherIdentity)),
    anonymous: appRouter.createCaller(context(null)),
  };
}
