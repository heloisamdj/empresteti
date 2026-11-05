import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const mode = process.argv[2] ?? "review";
const root = "docs/specs";
const specs = readdirSync(root).filter((name) => /^00[23]-/.test(name));
const evidenceFiles = [
  ":(exclude)docs/specs/*/verificacao.md",
  ":(exclude)ENTREGA.md",
  ":(exclude)handoff.md",
];
const failures = [];

for (const spec of specs) {
  const folder = `${root}/${spec}`;
  const reportPath = `${folder}/verificacao.md`;
  if (!["spec.md", "plan.md", "tasks.md", "verificacao.md"].every(
    (file) => existsSync(`${folder}/${file}`),
  )) {
    failures.push(`${spec}: faltam a spec, o plano, as tarefas ou o parecer.`);
    continue;
  }

  const report = readFileSync(reportPath, "utf8");
  const revision = report.match(/^Revisão: ([a-f0-9]{40})\s*$/m)?.[1];
  if (!revision || !/^Veredito: PRONTA(?:\s|$)/m.test(report)) {
    failures.push(`${spec}: o verificador precisa aprovar uma revisão identificada.`);
    continue;
  }

  const criteria = [...new Set(readFileSync(`${folder}/spec.md`, "utf8")
    .match(/\bCA-\d+\b/g) ?? [])];
  for (const criterion of criteria) {
    const rows = report.split(/\r?\n/).filter((line) =>
      line.split("|")[1]?.trim() === criterion);
    const cells = rows[0]?.split("|").map((cell) => cell.trim());
    if (rows.length !== 1 || cells[3] !== "ATENDIDO" || !/:\d+\b/.test(cells[2])) {
      failures.push(`${spec}: ${criterion} precisa de uma evidência com arquivo e linha.`);
    }
  }
  const checks = report.split(/\r?\n/).filter((line) => line.startsWith("Checks:"));
  if (!criteria.length || !checks.length || checks.some((line) => !/→ passou\s*$/.test(line))) {
    failures.push(`${spec}: CAs ou checks incompletos.`);
  }

  try {
    git("merge-base", "--is-ancestor", revision, "HEAD");
    if (git("diff", "--name-only", revision, "HEAD", "--", ".", ...evidenceFiles)) {
      failures.push(`${spec}: o código mudou após o parecer. Rode o verificador novamente.`);
    }
  } catch {
    failures.push(`${spec}: o SHA do parecer não pertence ao histórico da entrega.`);
  }
}

if (mode === "delivery" && (specs.length !== 2 || !existsSync("ENTREGA.md"))) {
  failures.push("A tag da prática exige as duas specs verificadas e o ENTREGA.md.");
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Pareceres conferidos: ${specs.length}.`);
}
