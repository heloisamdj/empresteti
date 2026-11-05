import { spawnSync } from "node:child_process";
const existing = spawnSync(
  "docker",
  ["inspect", "empresti-helo-dev", "--format", "{{.State.Running}}"],
  { encoding: "utf8" },
);
if (existing.status === 0) {
  if (existing.stdout.trim() !== "true") {
    const started = spawnSync("docker", ["start", "empresti-helo-dev"], {
      stdio: "inherit",
    });
    process.exit(started.status ?? 1);
  }
  console.log("PostgreSQL local do EmpresTI já está ativo na porta 5433.");
} else {
  const result = spawnSync("docker", ["compose", "up", "-d"], {
    stdio: "inherit",
  });
  process.exit(result.status ?? 1);
}
