const origin = new URL(
  process.argv[2] ?? "https://empresteti-hzyj.vercel.app/",
);
if (
  origin.protocol !== "https:" ||
  origin.hostname !== "empresteti-hzyj.vercel.app"
)
  throw new Error("Use o endereço do projeto informado pelo usuário.");
const results = [];
for (const path of ["/", "/login", "/catalogo", "/api/trpc/health"]) {
  try {
    const response = await fetch(new URL(path, origin), {
      signal: AbortSignal.timeout(20000),
    });
    const body = await response.text();
    results.push({
      path,
      status: response.status,
      title: body.match(/<title>(.*?)<\/title>/s)?.[1],
      placeholderCatalog: body.includes("A estrutura da tela será preenchida"),
      loginForm: body.includes("current-password"),
      healthOk: path.includes("health")
        ? body.includes('"status":"ok"')
        : undefined,
    });
  } catch {
    results.push({ path, status: "indisponível" });
  }
}
console.log(
  JSON.stringify(
    { origin: origin.origin, mode: "GET público, sem gravações", results },
    null,
    2,
  ),
);
