import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const gate = fileURLToPath(new URL("./check-spec-review.mjs", import.meta.url));
const specs = ["002-dados-iniciais", "003-solicitar-emprestimo"];
const passedChecks = [
  "npm run check:project",
  "npm run lint",
  "npm run typecheck",
  "npm test",
  "npm run build",
  "npm run test:e2e",
  "git diff --check",
  "git status --short",
]
  .map((command) => `Checks: ${command} → passou`)
  .join("\n");

test("gate da prática exige duas specs, evidências e checks da revisão", () => {
  const tempRoot = realpathSync(tmpdir());
  const repo = mkdtempSync(join(tempRoot, "empresti-gate-"));
  const git = (...args) =>
    execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim();
  function commit() {
    git("add", "-A");
    git(
      "-c",
      "user.name=Gate",
      "-c",
      "user.email=gate@example.test",
      "-c",
      "commit.gpgsign=false",
      "-c",
      "core.hooksPath=.",
      "commit",
      "-qm",
      "Fixture",
    );
  }
  function run(mode = "review") {
    const { status, stdout, stderr, error } = spawnSync(
      process.execPath,
      [gate, mode],
      {
        cwd: repo,
        encoding: "utf8",
      },
    );
    if (error) throw error;
    return { status, output: stdout + stderr };
  }
  function expectFailure(message, mode) {
    const result = run(mode);
    assert.equal(result.status, 1, result.output);
    assert.match(result.output, message);
  }

  try {
    git("init", "-q");
    writeFileSync(join(repo, "ENTREGA.md"), "Entrega da prática\n");
    commit();
    expectFailure(
      /002-dados-iniciais.*faltam[\s\S]*003-solicitar-emprestimo.*faltam/,
    );

    mkdirSync(join(repo, "tests"));
    writeFileSync(
      join(repo, "tests", "fluxo.test.ts"),
      [
        "// Esta linha não é um teste.",
        'test("spec 002 test_ca_01 carga", () => {});',
        'test("spec 003 test_ca_01 empréstimo", () => {});',
        "",
      ].join("\n"),
    );
    for (const spec of specs) {
      const folder = join(repo, "docs", "specs", spec);
      mkdirSync(folder, { recursive: true });
      writeFileSync(join(folder, "spec.md"), "- CA-01: critério da prática\n");
      writeFileSync(join(folder, "plan.md"), "Plano\n");
      writeFileSync(join(folder, "tasks.md"), "Tarefas\n");
    }
    commit();
    const sha = git("rev-parse", "HEAD");
    function report(
      specIndex,
      line,
      checks = passedChecks,
      verdict = "PRONTA",
    ) {
      const path = join(
        repo,
        "docs",
        "specs",
        specs[specIndex],
        "verificacao.md",
      );
      writeFileSync(
        path,
        [
          `Revisão: ${sha}`,
          `| CA-01 | tests/fluxo.test.ts:${line} | ATENDIDO | observação |`,
          checks,
          `Veredito: ${verdict}`,
          "",
        ].join("\n"),
      );
    }

    report(0, 1, "Checks: qualquer coisa → passou");
    report(1, 2);
    commit();
    expectFailure(/002-dados-iniciais.*checks incompletos/);
    expectFailure(/002-dados-iniciais: CA-01 precisa/);
    expectFailure(/003-solicitar-emprestimo: CA-01 precisa/);

    report(0, 2);
    report(1, 3, passedChecks, "NÃO PRONTA");
    commit();
    expectFailure(/003-solicitar-emprestimo.*precisa aprovar/);

    report(1, 3);
    expectFailure(/árvore limpa/, "delivery");
    commit();
    for (const mode of ["review", "delivery"]) {
      const result = run(mode);
      assert.equal(result.status, 0, result.output);
      assert.match(result.output, /Pareceres conferidos: 2/);
    }

    writeFileSync(
      join(repo, "tests", "fluxo.test.ts"),
      "// Mudança após parecer\n",
      { flag: "a" },
    );
    commit();
    expectFailure(/código mudou após o parecer/, "delivery");
  } finally {
    const resolved = realpathSync(repo);
    if (
      dirname(resolved) !== tempRoot ||
      !basename(resolved).startsWith("empresti-gate-")
    )
      throw new Error("Diretório temporário inesperado.");
    rmSync(resolved, { recursive: true, force: true });
  }
});
