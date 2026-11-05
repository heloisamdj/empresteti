import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import {
  pixabayImageUrl,
  pixabayLicense,
  pixabayPhotoPage,
} from "./pixabay.mjs";

const output = ".equipamentos-fotos";
const cacheFile = "candidatos-pixabay.json";
const cacheLifetime = 24 * 60 * 60 * 1000;
const extraQueries = {
  "TI-0001": "laptop isolated screen black",
  "TI-0004": "laptop isolated keyboard silver",
  "TI-0005": "computer monitor blank screen",
  "TI-0006": "computer desktop monitor blank display",
  "TI-0007": "flat screen display computer monitor",
  "TI-0009": "usb type c connector cable",
  "TI-0011": "usb webcam isolated camera",
  "TI-0012": "small point and shoot digital camera compact",
};
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

async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      redirect: "error",
      signal: AbortSignal.timeout(20_000),
      ...options,
    });
  } catch {
    throw new Error("Não foi possível acessar o Pixabay.");
  }
  if (!response.ok)
    throw new Error(`Pixabay respondeu HTTP ${response.status}.`);
  return response;
}

async function downloadImage(value) {
  let url = pixabayImageUrl(value);
  for (let hop = 0; hop < 3; hop++) {
    let response;
    try {
      response = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(20_000),
      });
    } catch {
      throw new Error("Falha ao baixar uma imagem do Pixabay.");
    }
    if (response.ok) return new Uint8Array(await response.arrayBuffer());
    const location = response.headers.get("location");
    if (response.status < 300 || response.status >= 400 || !location)
      throw new Error(`Imagem do Pixabay respondeu HTTP ${response.status}.`);
    url = pixabayImageUrl(new URL(location, url));
  }
  throw new Error(
    "O Pixabay retornou redirecionamentos demais para uma imagem.",
  );
}

async function search() {
  const apiKey = process.env.PIXABAY_API_KEY?.trim();
  if (!apiKey) throw new Error("Configure PIXABAY_API_KEY no ambiente local.");
  await mkdir(output, { recursive: true });
  const candidates = await readJson(cacheFile).catch((error) => {
    if (error.code === "ENOENT") return {};
    throw error;
  });
  const searches = inventory.flatMap(({ patrimonio, busca }) => [
    [patrimonio, busca],
    ...(extraQueries[patrimonio]
      ? [[`${patrimonio}-extra`, extraQueries[patrimonio]]]
      : []),
  ]);
  for (const [key, busca] of searches) {
    const cached = candidates[key];
    if (
      cached?.query === busca &&
      Date.now() - cached.fetchedAt < cacheLifetime
    )
      continue;
    const url = new URL("https://pixabay.com/api/");
    url.search = new URLSearchParams({
      key: apiKey,
      q: busca,
      image_type: "photo",
      orientation: "horizontal",
      safesearch: "true",
      per_page: "15",
    });
    const { hits } = await (await request(url)).json();
    candidates[key] = {
      query: busca,
      fetchedAt: Date.now(),
      photos: hits
        .filter((hit) => hit.type === "photo" && hit.largeImageURL)
        .map((hit) => ({
          id: hit.id,
          author: hit.user,
          page: hit.pageURL,
          image: hit.largeImageURL,
          preview: hit.previewURL,
        })),
    };
    await saveJson(cacheFile, candidates);
  }
}

export async function resizePhoto(page, bytes, crop = [0, 0, 1, 1]) {
  const encoded = await page.evaluate(
    async ({ base64, crop }) => {
      const image = new Image();
      image.src = `data:image/jpeg;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 600;
      const [left, top, cropWidth, cropHeight] = crop;
      const sourceWidth = cropWidth * image.naturalWidth;
      const sourceHeight = cropHeight * image.naturalHeight;
      const scale = Math.max(800 / sourceWidth, 600 / sourceHeight);
      const width = 800 / scale;
      const height = 600 / scale;
      canvas
        .getContext("2d")
        .drawImage(
          image,
          left * image.naturalWidth + (sourceWidth - width) / 2,
          top * image.naturalHeight + (sourceHeight - height) / 2,
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
    },
    { base64: Buffer.from(bytes).toString("base64"), crop },
  );
  return Buffer.from(encoded, "base64");
}

async function prepare() {
  const [candidates, selection] = await Promise.all([
    readJson(cacheFile),
    readJson("selecao-pixabay.json"),
  ]);
  const selections = inventory.map(({ patrimonio }) => {
    const value = selection[patrimonio];
    const chosen = Number.isSafeInteger(value) ? { id: value } : value;
    const crop = chosen?.crop ?? [0, 0, 1, 1];
    if (
      !Array.isArray(crop) ||
      crop.length !== 4 ||
      crop.some((n) => !Number.isFinite(n) || n < 0) ||
      crop[2] <= 0 ||
      crop[3] <= 0 ||
      crop[0] + crop[2] > 1 ||
      crop[1] + crop[3] > 1
    )
      throw new Error(`${patrimonio}: recorte fora dos limites da imagem.`);
    return { id: chosen?.id, crop };
  });
  const ids = selections.map(({ id }) => id);
  if (
    Object.keys(selection).length !== inventory.length ||
    ids.some((id) => !Number.isSafeInteger(id) || id < 1) ||
    new Set(ids).size !== inventory.length
  )
    throw new Error(
      "Selecione um ID distinto do Pixabay para cada patrimônio.",
    );

  const browser = await chromium.launch();
  const files = [];
  const originalHashes = new Set();
  const finalHashes = new Set();
  try {
    const page = await browser.newPage({ offline: true });
    for (const [index, item] of inventory.entries()) {
      const { id, crop } = selections[index];
      const photos = [
        ...(candidates[item.patrimonio]?.photos ?? []),
        ...(candidates[`${item.patrimonio}-extra`]?.photos ?? []),
      ];
      const photo = photos.find((candidate) => candidate.id === id);
      if (!photo?.author?.trim())
        throw new Error(
          `${item.patrimonio}: foto selecionada sem candidato ou crédito.`,
        );
      const photoPage = pixabayPhotoPage(photo.page, id);
      if (!photoPage)
        throw new Error(
          `${item.patrimonio}: página incompatível com o ID do Pixabay.`,
        );
      const originalBytes = await downloadImage(photo.image);
      const originalHash = digest(originalBytes);
      const webp = await resizePhoto(page, originalBytes, crop);
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
          pixabayId: id,
          crop,
          author: photo.author,
          source: photoPage.href,
          license: pixabayLicense,
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
    provider: "pixabay",
    status: "aguarda-revisao-visual-final",
    images: files.map(({ entry }) => entry),
  });
}

const command = process.argv[2];
if (command === "buscar") await search();
else if (command === "preparar") await prepare();
