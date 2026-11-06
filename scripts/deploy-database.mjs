// Job explícito de publicação. Nunca importado pelo aplicativo ou executado no boot.
// Usa credenciais já injetadas na Vercel, sem exportar valores sensíveis.
import { PrismaClient } from "@prisma/client";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const mode = process.argv[2];
const expectedProject = "prj_zaWeyVUhtZaqE4GH8SOfl6N4AsWm";
const tables = [
  "tenants",
  "users",
  "memberships",
  "equipments",
  "loans",
  "audit_logs",
  "rate_limit_counters",
];
const migrations = ["0001_init", "0002_return_request", "0003_equipment_photos"];
function check(value, message) {
  if (!value) throw new Error(message);
}
const clients = [];
function client(url) {
  const parsed = new URL(url);
  parsed.searchParams.set("connect_timeout", "15");
  parsed.searchParams.set("pool_timeout", "15");
  const instance = new PrismaClient({
    datasourceUrl: parsed.toString(),
    log: [],
  });
  clients.push(instance);
  return instance;
}
function connection(value, authRef) {
  check(value, "Conexão ausente.");
  const parsed = new URL(value);
  check(
    ["postgresql:", "postgres:"].includes(parsed.protocol),
    "Protocolo de banco inválido.",
  );
  check(
    parsed.hostname.endsWith(".supabase.co") ||
      parsed.hostname.endsWith(".supabase.com"),
    "A conexão não aponta ao Supabase.",
  );
  check(
    parsed.hostname === `db.${authRef}.supabase.co` ||
      decodeURIComponent(parsed.username).endsWith(`.${authRef}`),
    "Auth e PostgreSQL apontam a projetos diferentes.",
  );
  check(
    (parsed.searchParams.get("schema") ?? "public") === "public",
    "Este projeto usa exclusivamente o schema public.",
  );
  return {
    host: parsed.hostname,
    port: parsed.port || "5432",
    database: decodeURIComponent(parsed.pathname),
  };
}
async function overview(db) {
  const existing =
    await db.$queryRaw`SELECT relname AS tablename FROM pg_class WHERE relnamespace='public'::regnamespace AND relkind IN ('r','p','v','m','S','f','c') ORDER BY relname`;
  const names = existing.map((row) => row.tablename);
  const functions =
    await db.$queryRaw`SELECT p.proname AS name FROM pg_proc p WHERE p.pronamespace='public'::regnamespace AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid='pg_proc'::regclass AND d.objid=p.oid AND d.deptype='e')`;
  const types =
    await db.$queryRaw`SELECT t.typname AS name FROM pg_type t WHERE t.typnamespace='public'::regnamespace AND t.typtype IN ('e','d') AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid='pg_type'::regclass AND d.objid=t.oid AND d.deptype='e')`;
  const extraObjects = [
    ...functions.map((row) => `function:${row.name}`),
    ...types.map((row) => `type:${row.name}`),
  ];
  const history = names.includes("_prisma_migrations")
    ? await db.$queryRaw`SELECT migration_name, checksum, finished_at, rolled_back_at FROM public._prisma_migrations ORDER BY started_at`
    : [];
  for (const row of history) {
    if (row.rolled_back_at) continue;
    check(
      row.finished_at,
      "Existe migration interrompida; revisão necessária, sem reset automático.",
    );
    check(
      migrations.includes(row.migration_name),
      "Histórico remoto contém migration desconhecida; nenhuma alteração aplicada.",
    );
    const sql = await readFile(
      `prisma/migrations/${row.migration_name}/migration.sql`,
    );
    const lf = sql.toString("utf8").replace(/\r\n/g, "\n");
    const checksums = [sql, lf, lf.replace(/\n/g, "\r\n")].map((value) =>
      createHash("sha256").update(value).digest("hex"),
    );
    check(
      checksums.includes(row.checksum),
      "Checksum remoto difere do arquivo versionado; nenhuma alteração aplicada.",
    );
  }
  return {
    names,
    extraObjects,
    applied: history
      .filter((row) => row.finished_at && !row.rolled_back_at)
      .map((row) => row.migration_name),
  };
}
function redact(text) {
  let safe = text;
  for (const name of [
    "DATABASE_URL",
    "DIRECT_URL",
    "SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]) {
    const value = process.env[name];
    if (value) safe = safe.replaceAll(value, "[valor omitido]");
    if (value && name.endsWith("URL")) {
      try {
        const password = decodeURIComponent(new URL(value).password);
        if (password.length >= 4)
          safe = safe.replaceAll(password, "[senha omitida]");
      } catch {}
    }
  }
  return safe;
}
async function run(file, args) {
  try {
    const { stdout, stderr } = await promisify(execFile)(
      process.execPath,
      [file, ...args],
      { env: process.env, timeout: 120000, maxBuffer: 2 * 1024 * 1024 },
    );
    if (stdout) console.log(redact(stdout));
    if (stderr) console.log(redact(stderr));
  } catch (error) {
    if (error.stdout) console.error(redact(error.stdout));
    if (error.stderr) console.error(redact(error.stderr));
    throw new Error("O job Prisma falhou; publicação não deve ser promovida.");
  }
}
try {
  check(["verify", "migrate"].includes(mode), "Use verify ou migrate.");
  const vercel =
    process.env.VERCEL === "1" &&
    process.env.VERCEL_PROJECT_ID === expectedProject;
  const github =
    process.env.GITHUB_ACTIONS === "true" &&
    process.env.GITHUB_REPOSITORY === "heloisamdj/empresteti" &&
    process.env.EMPRESTI_DATABASE_JOB === "1";
  check(
    mode === "migrate" ? github : vercel || github,
    "Migration exige o job GitHub Actions autorizado; verificação exige Vercel ou esse job.",
  );
  const authUrl = new URL(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
  check(
    authUrl.hostname.endsWith(".supabase.co"),
    "Auth não aponta ao Supabase.",
  );
  const authRef = authUrl.hostname.split(".")[0];
  check(
    authRef === "pkncugbogwvxyulbngjr",
    "O destino autorizado para esta publicação é o Supabase pkncugbogwvxyulbngjr.",
  );
  console.log(
    JSON.stringify({
      job: mode,
      authProject: authRef,
      configuredRuntimeHost: new URL(process.env.DATABASE_URL).hostname,
      configuredDirectHost: new URL(process.env.DIRECT_URL).hostname,
    }),
  );
  const runtimeInfo = connection(process.env.DATABASE_URL, authRef);
  const directInfo = connection(process.env.DIRECT_URL, authRef);
  check(
    runtimeInfo.database === directInfo.database,
    "Runtime e migration apontam a bancos diferentes.",
  );
  console.log(
    JSON.stringify({
      job: mode,
      authProject: authRef,
      runtime: runtimeInfo,
      migration: directInfo,
    }),
  );
  const runtime = client(process.env.DATABASE_URL);
  const direct = client(process.env.DIRECT_URL);
  await runtime.$queryRaw`SELECT 1`;
  await direct.$queryRaw`SELECT 1`;
  const [runtimeIdentity] =
    await runtime.$queryRaw`SELECT current_database() AS database, current_schema() AS schema`;
  const [directIdentity] =
    await direct.$queryRaw`SELECT current_database() AS database, current_schema() AS schema`;
  const privilegesByConnection = await Promise.all(
    [runtime, direct].map(
      (db) =>
        db.$queryRaw`SELECT rolname, rolcanlogin, rolsuper, rolcreatedb, rolcreaterole, rolreplication, rolbypassrls, has_database_privilege(current_user,current_database(),'CREATE') AS can_create_schema FROM pg_roles WHERE rolname=current_user`,
    ),
  );
  for (const [privileges] of privilegesByConnection) {
    check(
      privileges.rolname === "empresti_v1" &&
        privileges.rolcanlogin &&
        !privileges.rolsuper &&
        !privileges.rolcreatedb &&
        !privileges.rolcreaterole &&
        !privileges.rolreplication &&
        !privileges.rolbypassrls,
      "A conexão exige o acesso dedicado empresti_v1 sem privilégios administrativos.",
    );
    if (mode === "verify")
      check(
        !privileges.can_create_schema,
        "Revogue o privilégio temporário CREATE no banco antes de publicar.",
      );
  }
  check(
    runtimeIdentity.database === directIdentity.database &&
      runtimeIdentity.schema === "public" &&
      directIdentity.schema === "public",
    "A identidade real do banco/schema difere entre as conexões.",
  );
  const before = await overview(direct);
  if (mode === "verify")
    check(
      migrations.every((name) => before.applied.includes(name)),
      "Aplique as migrations pendentes pelo job autorizado antes de publicar.",
    );
  console.log(
    JSON.stringify({
      database: "conectado",
      tables: before.names,
      extraObjects: before.extraObjects,
      applied: before.applied,
      pending: migrations.filter((name) => !before.applied.includes(name)),
    }),
  );
  if (mode === "migrate") {
    check(
      before.applied.length > 0 ||
        (before.names.every((name) => name === "_prisma_migrations") &&
          before.extraObjects.length === 0),
      "Schema público não vazio sem histórico Prisma; não será sobrescrito ou resetado.",
    );
    check(
      before.applied.includes("0002_return_request") ||
        !before.extraObjects.includes("function:check_loan_tenant"),
      "Existe uma função de integridade sem a migration correspondente; revisão necessária.",
    );
    await Promise.all(clients.map((db) => db.$disconnect()));
    await run("node_modules/prisma/build/index.js", ["migrate", "deploy"]);
    await run("node_modules/tsx/dist/cli.mjs", ["prisma/seed.ts"]);
    const after = await overview(direct);
    check(
      migrations.every((name) => after.applied.includes(name)),
      "Há migrations pendentes após a aplicação.",
    );
    const rls =
      await direct.$queryRaw`SELECT relname, relrowsecurity FROM pg_class WHERE relnamespace='public'::regnamespace AND relkind='r'`;
    check(
      tables.every((name) =>
        rls.some((row) => row.relname === name && row.relrowsecurity),
      ),
      "Uma tabela de domínio está sem RLS.",
    );
    console.log(
      JSON.stringify({
        database: "integrado",
        applied: after.applied,
        domainTables: tables.length,
        rls: "habilitado",
        tenant: "suporte_ti",
      }),
    );
  }
} catch (error) {
  console.error(
    JSON.stringify({
      job: "falhou",
      code: typeof error.code === "string" ? error.code : undefined,
      reason:
        error.name === "PrismaClientInitializationError"
          ? "Conexão PostgreSQL indisponível; valores omitidos."
          : redact(error.message),
    }),
  );
  process.exitCode = 1;
} finally {
  await Promise.all(clients.map((db) => db.$disconnect()));
}
