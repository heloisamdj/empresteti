// Diagnóstico somente leitura. Não carrega .env.local (o override do banco local).
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
const values = {};
for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)\s*=\s*["']?(.*?)["']?\s*$/);
  if (m) values[m[1]] = m[2];
}
const result = {
  checkedAt: new Date().toISOString(),
  mode: "somente leitura",
  auth: {},
  runtime: {},
  migrationConnection: {},
};
values.SUPABASE_URL ??= values.NEXT_PUBLIC_SUPABASE_URL;
values.SUPABASE_ANON_KEY ??= values.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const configured = (value) =>
  !!value && !/[<>\[\]]/.test(value) && !value.includes("your-");
const url = values.SUPABASE_URL;
if (configured(url) && configured(values.SUPABASE_SERVICE_ROLE_KEY)) {
  try {
    const target = new URL(url);
    if (!target.hostname.endsWith(".supabase.co"))
      throw new Error("host não é Supabase");
    const key = values.SUPABASE_SERVICE_ROLE_KEY;
    const response = await fetch(new URL("/rest/v1/", target), {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/openapi+json",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (response.ok) {
      const spec = await response.json();
      const tables = Object.keys(spec.paths ?? {})
        .filter((path) => path !== "/" && !path.startsWith("/rpc/"))
        .map((path) => path.slice(1))
        .sort();
      result.schemaApi = {
        ok: true,
        mode: "OpenAPI de metadados; nenhuma linha de tabela consultada",
        tables,
        expectedMissing: [
          "tenants",
          "users",
          "memberships",
          "equipments",
          "loans",
          "audit_logs",
          "rate_limit_counters",
        ].filter((name) => !tables.includes(name)),
      };
    } else result.schemaApi = { ok: false, httpStatus: response.status };
  } catch {
    result.schemaApi = {
      ok: false,
      reason: "Não foi possível consultar metadados da API",
    };
  }
}
if (!configured(url) || !configured(values.SUPABASE_ANON_KEY)) {
  result.auth = {
    ok: false,
    reason: "SUPABASE_URL ou SUPABASE_ANON_KEY ausente ou com placeholder",
  };
} else {
  try {
    const target = new URL(url);
    if (!target.hostname.endsWith(".supabase.co"))
      throw new Error("host não é Supabase");
    const response = await fetch(new URL("/auth/v1/health", target), {
      headers: { apikey: values.SUPABASE_ANON_KEY },
      signal: AbortSignal.timeout(15000),
    });
    result.auth = {
      host: target.hostname,
      ok: response.ok,
      httpStatus: response.status,
    };
  } catch {
    result.auth = {
      ok: false,
      reason:
        "Endpoint de autenticação não alcançável com a configuração atual",
    };
  }
}
for (const [key, section] of [
  ["DATABASE_URL", "runtime"],
  ["DIRECT_URL", "migrationConnection"],
]) {
  if (!configured(values[key])) {
    result[section] = {
      ok: false,
      reason: `${key} ausente ou com placeholder`,
    };
    continue;
  }
  let client;
  try {
    const connection = new URL(values[key]);
    if (["localhost", "127.0.0.1", "[::1]"].includes(connection.hostname)) {
      result[section] = {
        ok: false,
        configuredFor: "PostgreSQL local",
        reason: `${key} aponta ao banco local; falta a conexão PostgreSQL do Supabase`,
      };
      continue;
    }
    if (
      !connection.hostname.endsWith("supabase.com") &&
      !connection.hostname.endsWith("supabase.co")
    )
      throw new Error("host não é Supabase");
    connection.searchParams.set("connect_timeout", "10");
    connection.searchParams.set("pool_timeout", "10");
    client = new PrismaClient({
      datasourceUrl: connection.toString(),
      log: [],
    });
    await client.$queryRaw`SELECT 1`;
    result[section] = {
      host: connection.hostname,
      port: connection.port || "5432",
      ok: true,
    };
  } catch (error) {
    result[section] = {
      ok: false,
      code: typeof error?.code === "string" ? error.code : "CONNECTION_FAILED",
      reason:
        "Conexão recusada, indisponível ou configuração inválida; credenciais não são exibidas",
    };
  } finally {
    if (client) await client.$disconnect();
  }
}
console.log(JSON.stringify(result, null, 2));
