import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const output = ".equipamentos-fotos";
const license = "https://www.pexels.com/license/";
const inventory = JSON.parse(
  await readFile(
    new URL("../assets/equipamentos.json", import.meta.url),
    "utf8",
  ),
);
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const readJson = async (name) =>
  JSON.parse(await readFile(join(output, name), "utf8"));
const saveJson = (name, value) =>
  writeFile(join(output, name), `${JSON.stringify(value, null, 2)}\n`);

function origin(value, host) {
  const url = new URL(value);
  if (url.origin !== `https://${host}` || url.username || url.password)
    throw new Error(`Origem fora do Pexels: ${host} era esperado.`);
  return url;
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    redirect: "error",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok)
    throw new Error(`Pexels respondeu HTTP ${response.status}.`);
  return response;
}

async function search() {
  const apiKey = process.env.PEXELS_API_KEY?.trim();
  if (!apiKey) throw new Error("Configure PEXELS_API_KEY no ambiente local.");
  const candidates = {};
  for (const { patrimonio, busca } of inventory) {
    const url = new URL("https://api.pexels.com/v1/search");
    url.search = new URLSearchParams({
      query: busca,
      orientation: "landscape",
      per_page: "15",
    });
    const { photos } = await (
      await request(url, { headers: { Authorization: apiKey } })
    ).json();
    candidates[patrimonio] = photos.map((photo) => ({
      id: photo.id,
      author: photo.photographer,
      page: photo.url,
      original: photo.src.original,
    }));
  }
  await mkdir(output, { recursive: true });
  await saveJson("candidatos.json", candidates);
}

export async function resizePhoto(page, bytes) {
  const encoded = await page.evaluate(async (base64) => {
    const image = new Image();
    image.src = `data:image/jpeg;base64,${base64}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const scale = Math.max(800 / image.naturalWidth, 600 / image.naturalHeight);
    const width = 800 / scale;
    const height = 600 / scale;
    canvas
      .getContext("2d")
      .drawImage(
        image,
        (image.naturalWidth - width) / 2,
        (image.naturalHeight - height) / 2,
        width,
        height,
        0,
        0,
        800,
        600,
      );
    const result = canvas.toDataURL("image/webp", 0.88);
    const verification = new Image();
    verification.src = result;
    await verification.decode();
    if (
      !result.startsWith("data:image/webp;base64,") ||
      verification.naturalWidth !== 800 ||
      verification.naturalHeight !== 600
    )
      throw new Error("O arquivo final precisa ser WebP de 800 × 600.");
    return result.split(",")[1];
  }, Buffer.from(bytes).toString("base64"));
  return Buffer.from(encoded, "base64");
}

async function prepare() {
  const [candidates, selection] = await Promise.all([
    readJson("candidatos.json"),
    readJson("selecao.json"),
  ]);
  const ids = inventory.map(({ patrimonio }) => selection[patrimonio]);
  if (
    Object.keys(selection).length !== inventory.length ||
    ids.some((id) => !Number.isSafeInteger(id) || id < 1) ||
    new Set(ids).size !== inventory.length
  )
    throw new Error("Selecione um ID distinto do Pexels para cada patrimônio.");

  const browser = await chromium.launch();
  const files = [];
  const originalHashes = new Set();
  const finalHashes = new Set();
  try {
    const page = await browser.newPage({ offline: true });
    for (const item of inventory) {
      const id = selection[item.patrimonio];
      const photo = candidates[item.patrimonio]?.find(
        (candidate) => candidate.id === id,
      );
      if (!photo?.author?.trim())
        throw new Error(
          `${item.patrimonio}: foto selecionada sem candidato ou crédito.`,
        );
      const photoPage = origin(photo.page, "www.pexels.com");
      const original = origin(photo.original, "images.pexels.com");
      if (
        !photoPage.pathname.startsWith("/photo/") ||
        !photoPage.pathname.replace(/\/$/, "").endsWith(`-${id}`) ||
        !original.pathname.startsWith(`/photos/${id}/`)
      )
        throw new Error(
          `${item.patrimonio}: URLs incompatíveis com o ID do Pexels.`,
        );

      const response = await request(original);
      const originalBytes = new Uint8Array(await response.arrayBuffer());
      const originalHash = digest(originalBytes);
      const webp = await resizePhoto(page, originalBytes);
      const hash = digest(webp);
      if (originalHashes.has(originalHash) || finalHashes.has(hash))
        throw new Error(
          `${item.patrimonio}: a foto repete o conteúdo de outro equipamento.`,
        );
      originalHashes.add(originalHash);
      finalHashes.add(hash);
      files.push({
        webp,
        entry: {
          ...item,
          storagePath: `${item.patrimonio}/${hash}.webp`,
          pexelsId: id,
          author: photo.author,
          source: photoPage.href,
          license,
          sha256: hash,
          width: 800,
          height: 600,
        },
      });
    }
  } finally {
    await browser.close();
  }

  for (const { entry, webp } of files) {
    const root = join(output, "arquivos", entry.patrimonio);
    await mkdir(root, { recursive: true });
    await writeFile(join(output, "arquivos", entry.storagePath), webp);
  }
  await saveJson("manifesto.json", {
    status: "aguarda-revisao-visual-final",
    images: files.map(({ entry }) => entry),
  });
}

const command = process.argv[2];
if (command === "buscar") await search();
else if (command === "preparar") await prepare();
