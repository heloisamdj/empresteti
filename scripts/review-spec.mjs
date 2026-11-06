import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";

const [spec, ref, checksPath, baseRef] = process.argv.slice(2);
const shaPattern = /^[a-f0-9]{7,40}$/;
if (
  !/^docs\/specs\/\d{3}-[a-z0-9-]+\/spec\.md$/.test(spec ?? "") ||
  !shaPattern.test(ref ?? "") ||
  (baseRef !== undefined && !shaPattern.test(baseRef)) ||
  !checksPath
) {
  throw new Error(
    "Uso: node scripts/review-spec.mjs <spec.md> <SHA> <resultado-dos-checks.txt> [SHA-base]",
  );
}
const revision = execFileSync(
  "git",
  ["rev-parse", "--verify", `${ref}^{commit}`],
  {
    encoding: "utf8",
  },
).trim();
const checks = readFileSync(checksPath, "utf8");
const diff = baseRef
  ? execFileSync(
      "git",
      [
        "diff",
        "--no-ext-diff",
        "--no-textconv",
        baseRef,
        revision,
        "--",
        ".",
        ":(exclude)docs/specs/*/verificacao.md",
        ":(exclude)ENTREGA.md",
        ":(exclude)handoff.md",
      ],
      { encoding: "utf8" },
    )
  : "Nenhuma base fornecida.";
const tempRoot = realpathSync(tmpdir());
const snapshot = mkdtempSync(join(tempRoot, "empresti-review-"));

try {
  const archive = join(snapshot, "snapshot.tar");
  execFileSync("git", ["archive", "--format=tar", "-o", archive, revision]);
  execFileSync("tar", ["-xf", archive, "-C", snapshot]);
  rmSync(archive);
  const files = execFileSync(
    "git",
    ["ls-tree", "-r", "--name-only", revision],
    {
      encoding: "utf8",
    },
  )
    .split(/\r?\n/)
    .filter(
      (path) =>
        !path.endsWith("/verificacao.md") &&
        (/^(AGENTS\.md|agents\/verificador-spec\.md|rules\/[a-z-]+\.md|docs\/(PRD\.md|adr\/[^/]+\.md)|package\.json)$/.test(
          path,
        ) ||
          path.startsWith(`${spec.slice(0, -"spec.md".length)}`) ||
          /^(src|tests|prisma|scripts|skills)\/.*\.(tsx?|mjs|sql|prisma|md|json)$/.test(
            path,
          )),
    );
  const sources = files
    .map(
      (path) =>
        `<arquivo caminho="${path}">\n${readFileSync(join(snapshot, path), "utf8")}\n</arquivo>`,
    )
    .join("\n");
  const prompt = [
    "Esta sessão descartável começa com esta única mensagem. Ela não tem a conversa do agente principal.",
    "Acione o papel verificador-spec em um subagente novo, com herança desta sessão descartável para receber o pacote abaixo.",
    "Na chamada de delegação, use a opção de herdar o contexto para transmitir esta mensagem integral. O contexto herdado contém somente esta execução isolada, a spec, o SHA, os checks, o diff e as fontes versionadas.",
    "O verificador lê os arquivos versionados fornecidos abaixo. Ferramentas de shell estão desativadas.",
    `Spec: ${spec}`,
    `SHA: ${revision}`,
    "<checks>",
    checks,
    "</checks>",
    "<diff>",
    diff,
    "</diff>",
    "<fontes>",
    sources,
    "</fontes>",
    "Devolva exatamente o parecer do verificador, sem completar lacunas.",
  ].join("\n");
  const output = join(snapshot, "parecer.txt");
  // O subagente usa o registro desta sessão nova para herdar o pacote.
  const run = spawnSync(
    "codex",
    [
      "exec",
      "--cd",
      snapshot,
      "--skip-git-repo-check",
      "--ignore-user-config",
      "--sandbox",
      "read-only",
      "--disable",
      "hooks",
      "--disable",
      "shell_tool",
      "--disable",
      "apps",
      "--disable",
      "plugins",
      "--disable",
      "memories",
      "--disable",
      "request_permissions_tool",
      "-c",
      'approval_policy="never"',
      "-c",
      'shell_environment_policy.inherit="none"',
      "-c",
      'web_search="disabled"',
      "-c",
      `projects.${JSON.stringify(snapshot)}.trust_level="trusted"`,
      "--output-last-message",
      output,
      "-",
    ],
    { input: prompt, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
  );
  if (run.error) throw run.error;
  if (run.status !== 0) {
    console.error(`Codex encerrou a revisão com status ${run.status}.`);
    process.exitCode = run.status ?? 1;
  } else {
    const report = readFileSync(output, "utf8").trimEnd();
    if (!/^Veredito: (?:PRONTA|NÃO PRONTA)(?: — .+)?$/m.test(report)) {
      console.error("A sessão não devolveu um veredito no formato exigido.");
      process.exitCode = 1;
    }
    console.log(report);
  }
} finally {
  const resolved = realpathSync(snapshot);
  if (
    dirname(resolved) !== tempRoot ||
    !basename(resolved).startsWith("empresti-review-")
  )
    throw new Error("Diretório temporário inesperado.");
  rmSync(resolved, { recursive: true, force: true });
}
