import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const mode = process.argv[2] ?? "review";
if (!["review", "delivery"].includes(mode)) {
  throw new Error("Use review ou delivery.");
}
const root = "docs/specs";
const specs = ["002-dados-iniciais", "003-solicitar-emprestimo"];
const requiredChecks = [
  "npm run check:project",
  "npm run lint",
  "npm run typecheck",
  "npm test",
  "npm run build",
  "npm run test:e2e",
  "git diff --check",
  "git status --short",
];
const evidenceFiles = [
  ":(exclude)docs/specs/*/verificacao.md",
  ":(exclude)ENTREGA.md",
  ":(exclude)handoff.md",
];
const failures = [];
if (git("status", "--porcelain")) {
  failures.push("Rode o gate com a árvore limpa no commit a ser entregue.");
}

function citesCriterionTest(evidence, spec, criterion) {
  const references = evidence.matchAll(
    /\b(tests\/[\w./-]+\.(?:spec|test)\.[jt]sx?):(\d+)\b/g,
  );
  for (const [, file, line] of references) {
    if (file.split("/").includes("..") || !existsSync(file)) continue;
    const declaration = readFileSync(file, "utf8").split(/\r?\n/)[
      Number(line) - 1
    ];
    const title = declaration?.match(/^\s*(?:test|it)\(\s*["'`]([^"'`]*)/)?.[1];
    const ids = title?.match(
      new RegExp(`\\bspec ${spec.slice(0, 3)} test_((?:ca_\\d+_?)+)`),
    )?.[1];
    if (
      ids?.match(/ca_\d+/g)?.includes(criterion.toLowerCase().replace("-", "_"))
    )
      return true;
  }
  return false;
}

for (const spec of specs) {
  const folder = `${root}/${spec}`;
  const reportPath = `${folder}/verificacao.md`;
  if (
    !["spec.md", "plan.md", "tasks.md", "verificacao.md"].every((file) =>
      existsSync(`${folder}/${file}`),
    )
  ) {
    failures.push(`${spec}: faltam a spec, o plano, as tarefas ou o parecer.`);
    continue;
  }

  const report = readFileSync(reportPath, "utf8");
  const revisions = report.match(/^Revisão:.*$/gm) ?? [];
  const revision = revisions[0]?.match(/^Revisão: ([a-f0-9]{40})\s*$/)?.[1];
  const verdicts = report.match(/^Veredito:.*$/gm) ?? [];
  if (
    !revision ||
    revisions.length !== 1 ||
    verdicts.length !== 1 ||
    !/^Veredito: PRONTA(?: — \S.*)?$/.test(verdicts[0])
  ) {
    failures.push(
      `${spec}: o verificador precisa aprovar uma revisão identificada.`,
    );
    continue;
  }

  const criteria = [
    ...new Set(
      readFileSync(`${folder}/spec.md`, "utf8").match(/\bCA-\d+\b/g) ?? [],
    ),
  ];
  for (const criterion of criteria) {
    const rows = report
      .split(/\r?\n/)
      .filter((line) => line.split("|")[1]?.trim() === criterion);
    const cells = rows[0]?.split("|").map((cell) => cell.trim());
    if (
      rows.length !== 1 ||
      cells?.[3] !== "ATENDIDO" ||
      !citesCriterionTest(cells[2] ?? "", spec, criterion)
    ) {
      failures.push(
        `${spec}: ${criterion} precisa citar a linha de declaração de um teste identificado com a spec e o CA.`,
      );
    }
  }
  const checks = report
    .split(/\r?\n/)
    .filter((line) => line.startsWith("Checks:"))
    .map((line) => line.trimEnd());
  if (
    !criteria.length ||
    checks.length !== requiredChecks.length ||
    !requiredChecks.every((command) =>
      checks.includes(`Checks: ${command} → passou`),
    )
  ) {
    failures.push(`${spec}: CAs ou checks incompletos.`);
  }

  try {
    git("merge-base", "--is-ancestor", revision, "HEAD");
    if (
      git("diff", "--name-only", revision, "HEAD", "--", ".", ...evidenceFiles)
    ) {
      failures.push(
        `${spec}: o código mudou após o parecer. Rode o verificador novamente.`,
      );
    }
  } catch {
    failures.push(
      `${spec}: o SHA do parecer não pertence ao histórico da entrega.`,
    );
  }
}

if (mode === "delivery" && !existsSync("ENTREGA.md")) {
  failures.push(
    "A tag da prática exige as duas specs verificadas e o ENTREGA.md.",
  );
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Pareceres conferidos: ${specs.length}.`);
}
