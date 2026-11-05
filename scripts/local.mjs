import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

for (const name of [".env", ".env.local"]) {
  if (!existsSync(name)) continue;
  for (const line of readFileSync(name, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)\s*=\s*["']?(.*?)["']?\s*$/);
    if (m) process.env[m[1]] = m[2];
  }
}
const action = process.argv[2];
const commands = {
  migrate: ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  seed: ["node_modules/tsx/dist/cli.mjs", "prisma/seed.ts"],
  provision: ["scripts/provision-user.mjs", ...process.argv.slice(3)],
};
if (!commands[action]) throw new Error("Use migrate, seed ou provision.");
for (const name of ["DATABASE_URL", "DIRECT_URL"]) {
  const url = new URL(process.env[name] ?? "");
  if (
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
    !url.pathname.startsWith("/empresti")
  )
    throw new Error(
      "Operação bloqueada: somente banco local exclusivo do EmpresTI.",
    );
}
const result = spawnSync(
  process.execPath,
  commands[action].map((s, i) => (i === 0 ? resolve(s) : s)),
  { stdio: "inherit", env: process.env },
);
process.exit(result.status ?? 1);
