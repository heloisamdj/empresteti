import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { fixtures, startDatabase } from "../helpers/database";
import { appRouter } from "../../src/server/api/root";
import type { Context } from "../../src/server/api/trpc";

let env: Awaited<ReturnType<typeof startDatabase>>;
let f: Awaited<ReturnType<typeof fixtures>>;
beforeAll(async () => {
  env = await startDatabase();
}, 120000);
beforeEach(async () => {
  f = await fixtures(env.db);
});
afterAll(async () => {
  if (env) await env.stop();
});
const input = { search: "", availableOnly: false, limit: 7 };

describe("Critérios da spec 001 em PostgreSQL real", () => {
  it("test_ca_01_login exige sessão e vínculo, sem retornar tokens", async () => {
    expect(await f.anonymous.auth.session()).toBeNull();
    await expect(f.anonymous.equipment.list(input)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    const auth = {
      auth: {
        signInWithPassword: async () => ({
          data: { user: { id: f.user.authUserId } },
          error: null,
        }),
        signOut: async () => ({ error: null }),
      },
    } as unknown as Context["auth"];
    const caller = appRouter.createCaller({ ...f.context(null), auth });
    const result = await caller.auth.login({
      email: f.user.email,
      password: "senha-teste",
    });
    expect(result).toMatchObject({ id: f.user.id, tenantId: f.tenant.id });
    expect(result).not.toHaveProperty("access_token");
    expect(await f.caller.auth.session()).not.toHaveProperty("otherTenant");
    expect(await f.caller.auth.logout()).toEqual({ ok: true });
    await expect(f.anonymous.auth.logout()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
  it("test_ca_01_conta_sem_convite não recebe acesso", async () => {
    const auth = {
      auth: {
        signInWithPassword: async () => ({
          data: { user: { id: randomUUID() } },
          error: null,
        }),
        signOut: async () => ({ error: null }),
      },
    } as unknown as Context["auth"];
    await expect(
      appRouter
        .createCaller({ ...f.context(null), auth })
        .auth.login({ email: "sem-vinculo@example.test", password: "teste" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
  it("test_ca_02_catalogo_detalhe e isolamento de tenant", async () => {
    const list = await f.caller.equipment.list(input);
    expect(list.availableCount).toBe(1);
    expect(list.items[0]).toMatchObject({
      id: f.equipment.id,
      status: "AVAILABLE",
      loans: [],
    });
    expect(
      (await f.caller.equipment.detail({ patrimony: "PAT-1042" })).id,
    ).toBe(f.equipment.id);
    expect((await f.other.equipment.list(input)).total).toBe(0);
    expect((await f.other.equipment.list(input)).availableCount).toBe(0);
    await expect(
      f.other.equipment.detail({ patrimony: "PAT-1042" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
  it("test_ca_03_vazio não é erro nem substitui dados reais", async () => {
    expect((await f.other.equipment.list(input)).items).toEqual([]);
    expect((await f.caller.equipment.list(input)).items).toHaveLength(1);
    expect(
      (await f.caller.equipment.list({ ...input, search: "inexistente" }))
        .items,
    ).toEqual([]);
  });
  it("test_ca_04_limite três e solicitações concorrentes", async () => {
    const items = await Promise.all(
      [0, 1, 2, 3].map((i) =>
        env.db.equipment.create({
          data: {
            tenantId: f.tenant.id,
            category: "MONITOR",
            name: `Monitor ${i}`,
            patrimony: `PAT-200${i}`,
          },
        }),
      ),
    );
    const results = await Promise.allSettled(
      items.map((item) => f.caller.loans.request({ id: item.id })),
    );
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(3);
    expect(await env.db.loan.count()).toBe(3);
  });
  it("test_ca_04_atraso bloqueia mesmo com vagas", async () => {
    await env.db.loan.create({
      data: {
        tenantId: f.tenant.id,
        userId: f.user.id,
        equipmentId: f.equipment.id,
        borrowedAt: new Date("2026-01-01"),
        dueDate: new Date("2026-01-15"),
      },
    });
    const other = await env.db.equipment.create({
      data: {
        tenantId: f.tenant.id,
        name: "Outro",
        patrimony: "PAT-2222",
        category: "NOTEBOOK",
      },
    });
    await expect(f.caller.loans.request({ id: other.id })).rejects.toThrow(
      /atraso/,
    );
  });
  it("test_ca_05_prazo 14 dias, disputa de equipamento e isolamento de request", async () => {
    await expect(
      f.other.loans.request({ id: f.equipment.id }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    const results = await Promise.allSettled([
      f.caller.loans.request({ id: f.equipment.id }),
      f.caller.loans.request({ id: f.equipment.id }),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect((await f.caller.equipment.list(input)).availableCount).toBe(0);
    const loan = await env.db.loan.findFirstOrThrow();
    expect(loan.dueDate.getTime() - loan.borrowedAt.getTime()).toBe(
      14 * 86400000,
    );
  });
  it("test_ca_06_manutencao nunca fica disponível e fora de uso sai do catálogo", async () => {
    await env.db.equipment.update({
      where: { id: f.equipment.id },
      data: { status: "MAINTENANCE" },
    });
    expect(
      (await f.caller.equipment.list({ ...input, availableOnly: true })).total,
    ).toBe(0);
    await expect(
      f.caller.loans.request({ id: f.equipment.id }),
    ).rejects.toThrow(/indisponível/);
    await env.db.equipment.update({
      where: { id: f.equipment.id },
      data: { status: "OUT_OF_SERVICE" },
    });
    expect((await f.caller.equipment.list(input)).total).toBe(0);
  });
  it("test_ca_07_solicitar_devolucao mantém empréstimo aberto e isola usuários", async () => {
    const loan = await f.caller.loans.request({ id: f.equipment.id });
    expect((await f.other.loans.mine()).items).toHaveLength(0);
    await expect(
      f.other.loans.requestReturn({ id: loan.id }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    const pending = await f.caller.loans.requestReturn({ id: loan.id });
    expect(pending.returnRequestedAt).toBeInstanceOf(Date);
    expect(pending.returnedAt).toBeNull();
    expect((await f.caller.loans.mine()).openCount).toBe(1);
    expect(
      (await f.caller.equipment.list({ ...input, availableOnly: true })).total,
    ).toBe(0);
  });
  it("test_ca_08_confirmacao encerra, libera item e não atravessa tenant", async () => {
    const loan = await f.caller.loans.request({ id: f.equipment.id });
    await expect(
      f.caller.loans.confirmReturn({ id: loan.id }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await f.caller.loans.requestReturn({ id: loan.id });
    await expect(
      f.other.loans.confirmReturn({ id: loan.id }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await f.caller.loans.confirmReturn({ id: loan.id });
    expect((await f.caller.loans.mine()).openCount).toBe(0);
    expect(
      (await f.caller.equipment.list({ ...input, availableOnly: true })).total,
    ).toBe(1);
    expect(
      await env.db.auditLog.count({ where: { resourceId: loan.id } }),
    ).toBe(3);
    await expect(
      f.caller.loans.confirmReturn({ id: loan.id }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
  it("test_ca_09_member opera dentro do próprio tenant", async () => {
    expect(f.identity.role).toBe("MEMBER");
    expect(
      (await f.caller.loans.operations({ search: "", filter: "all", limit: 7 }))
        .total,
    ).toBe(0);
    await expect(
      f.anonymous.loans.operations({ search: "", filter: "all", limit: 7 }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
  it("test_ca_10_cursor filtros contagem e isolamento de operações", async () => {
    for (let i = 0; i < 9; i++) {
      const item = await env.db.equipment.create({
        data: {
          tenantId: f.tenant.id,
          name: `Monitor ${i}`,
          patrimony: `PAT-300${i}`,
          category: "MONITOR",
        },
      });
      await env.db.loan.create({
        data: {
          tenantId: f.tenant.id,
          userId: f.user.id,
          equipmentId: item.id,
          borrowedAt: new Date("2026-01-01"),
          dueDate: new Date("2026-01-15"),
        },
      });
    }
    const page = await f.caller.loans.operations({
      search: "",
      filter: "late",
      limit: 7,
    });
    expect(page.items).toHaveLength(7);
    expect(page.total).toBe(9);
    const next = await f.caller.loans.operations({
      search: "",
      filter: "late",
      limit: 7,
      cursor: page.nextCursor,
    });
    expect(next.items).toHaveLength(2);
    expect(next.nextCursor).toBeUndefined();
    expect(new Set([...page.items, ...next.items].map((i) => i.id)).size).toBe(
      9,
    );
    expect(
      (await f.other.loans.operations({ search: "", filter: "all", limit: 7 }))
        .stats.open,
    ).toBe(0);
    expect(
      (
        await f.caller.loans.operations({
          search: "Monitor 2",
          filter: "all",
          limit: 7,
        })
      ).total,
    ).toBe(1);
  });
  it("test_ca_11_cadastro valida patrimônio, categorias e injeção de tenant", async () => {
    const item = await f.caller.equipment.create({
      name: "Dock USB-C",
      patrimony: "PAT-9999",
      category: "ACCESSORY",
      status: "MAINTENANCE",
    });
    expect(item.tenantId).toBe(f.tenant.id);
    await expect(
      f.caller.equipment.create({
        name: "Duplicado",
        patrimony: "PAT-9999",
        category: "MONITOR",
        status: "AVAILABLE",
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
    await expect(
      f.caller.equipment.create({
        name: "Injetado",
        patrimony: "PAT-8888",
        category: "MONITOR",
        status: "AVAILABLE",
        tenantId: f.otherTenant.id,
      } as never),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    const own = await f.other.equipment.create({
      name: "Outro tenant",
      patrimony: "PAT-9999",
      category: "CAMERA",
      status: "AVAILABLE",
    });
    expect(own.tenantId).toBe(f.otherTenant.id);
    expect(
      (await f.caller.equipment.list(input)).items.map((i) => i.id),
    ).not.toContain(own.id);
  });
  it("test_ca_12_fatia_zero e garantias de banco RLS/auditoria", async () => {
    expect(await f.anonymous.health()).toEqual({
      status: "ok",
      database: "conectado",
    });
    const tables = await env.db.$queryRaw<
      { relname: string; relrowsecurity: boolean }[]
    >`SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('loans','equipments','memberships','audit_logs')`;
    expect(tables).toHaveLength(4);
    expect(tables.every((t) => t.relrowsecurity)).toBe(true);
    await f.caller.loans.request({ id: f.equipment.id });
    await expect(
      env.db.auditLog.updateMany({ data: { action: "apagado" } }),
    ).rejects.toThrow(/append-only/);
    await env.db.$executeRawUnsafe("CREATE ROLE test_reader NOLOGIN");
    await env.db.$executeRawUnsafe(
      "GRANT USAGE ON SCHEMA public TO test_reader",
    );
    await env.db.$executeRawUnsafe("GRANT SELECT ON equipments TO test_reader");
    const visible = await env.db.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET LOCAL ROLE test_reader");
      return tx.equipment.count();
    });
    expect(visible).toBe(0);
  });
});
