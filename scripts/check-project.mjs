import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const failures = [];
for (const name of [
  "restrictions",
  "operacao",
  "checks",
  "migration",
  "secrets",
  "tests",
  "handoff",
  "spec-flow",
])
  if (!existsSync(`rules/${name}.md`)) failures.push(`Falta rules/${name}.md`);
for (const file of ["spec", "plan", "tasks"])
  if (!existsSync(`docs/specs/001-frontend/${file}.md`))
    failures.push(`Falta ${file}.md`);
for (const directory of readdirSync("skills")) {
  const path = `skills/${directory}/SKILL.md`;
  if (!existsSync(path) || directory === "template") continue;
  const text = readFileSync(path, "utf8");
  if (!text.includes(`name: ${directory}`) || !/description: .+/.test(text))
    failures.push(`Frontmatter inválido: ${path}`);
}
function walk(path) {
  return readdirSync(path).flatMap((name) => {
    const file = join(path, name);
    return statSync(file).isDirectory() ? walk(file) : [file];
  });
}
for (const file of walk("src")) {
  if (!/\.[jt]sx?$/.test(file)) continue;
  const source = readFileSync(file, "utf8");
  if (/localStorage|sessionStorage|SUPABASE_SERVICE_ROLE_KEY/.test(source))
    failures.push(`Armazenamento/chave proibida no app: ${file}`);
  if (source.includes('"use server"'))
    failures.push(`Server Action proibida: ${file}`);
  if (file.includes("components") && /from ["']@prisma\/client/.test(source))
    failures.push(`Prisma no cliente: ${file}`);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    "Estrutura, oito regras, skills e fronteiras básicas verificadas.",
  );
