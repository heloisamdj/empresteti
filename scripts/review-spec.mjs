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
    "Acione o subagente verificador-spec em contexto novo para esta revisão.",
    "Passe ao subagente o pacote de fontes, o diff, o SHA e os checks. Não passe outra conversa.",
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
  const run = spawnSync(
    "codex",
    [
      "exec",
      "--cd",
      snapshot,
      "--skip-git-repo-check",
      "--ephemeral",
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
  if (run.status === 0) console.log(readFileSync(output, "utf8").trimEnd());
  else console.error(`Codex encerrou a revisão com status ${run.status}.`);
  process.exitCode = run.status ?? 1;
} finally {
  const resolved = realpathSync(snapshot);
  if (
    dirname(resolved) !== tempRoot ||
    !basename(resolved).startsWith("empresti-review-")
  )
    throw new Error("Diretório temporário inesperado.");
  rmSync(resolved, { recursive: true, force: true });
}
