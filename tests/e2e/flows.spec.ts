import { test, expect, type Page } from "@playwright/test";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { fixtures, startDatabase } from "../helpers/database";
import { appRouter } from "../../src/server/api/root";
import type { Context } from "../../src/server/api/trpc";
import inventory from "../../skills/imagens-equipamentos/assets/equipamentos.json";

let env: Awaited<ReturnType<typeof startDatabase>>;
let f: Awaited<ReturnType<typeof fixtures>>;
test.beforeAll(async () => {
  env = await startDatabase();
});
test.afterAll(async () => {
  if (env) await env.stop();
});
test.beforeEach(async () => {
  f = await fixtures(env.db);
});

// Somente o provedor de identidade é simulado. Router, Services, Prisma e
// PostgreSQL são reais. Nenhum modo de autenticação de teste existe no app.
async function connect(page: Page, loggedIn = true) {
  let authenticated = loggedIn;
  const auth = {
    auth: {
      signInWithPassword: async () => {
        authenticated = true;
        return { data: { user: { id: f.user.authUserId } }, error: null };
      },
      signOut: async () => {
        authenticated = false;
        return { error: null };
      },
    },
  } as unknown as Context["auth"];
  await page.route(/\/api\/trpc\//, async (route) => {
    const req = route.request();
    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      router: appRouter,
      req: new Request(req.url(), {
        method: req.method(),
        headers: req.headers(),
        ...(req.method() === "POST" ? { body: req.postData() } : {}),
      }),
      createContext: () => ({
        ...f.context(authenticated ? f.identity : null),
        auth,
      }),
    });
    await route.fulfill({
      status: response.status,
      headers: Object.fromEntries(response.headers),
      body: await response.text(),
    });
  });
}
test("test_ca_01_login e redirecionamento de rota protegida", async ({
  page,
}) => {
  await connect(page, false);
  await page.goto("/catalogo");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("E-mail", { exact: true }).fill("marina@example.test");
  await page.getByLabel("Senha", { exact: true }).fill("senha-teste");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Catálogo", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sair", exact: true }).first().click();
  await expect(page).toHaveURL(/\/login$/);
});
test("spec 002 test_ca_04 e spec 003 test_ca_01_ca_04 catálogo exibe fotos e crédito Pexels", async ({
  page,
}) => {
  await connect(page);
  const category = {
    notebook: "NOTEBOOK",
    monitor: "MONITOR",
    cabo: "CABLE",
    camera: "CAMERA",
  } as const;
  await env.db.equipment.delete({ where: { id: f.equipment.id } });
  await env.db.equipment.createMany({
    data: inventory.map((item, index) => ({
      tenantId: f.tenant.id,
      name: item.nome,
      category: category[item.categoria as keyof typeof category],
      patrimony: item.patrimonio,
      status: item.situacao === "manutencao" ? "MAINTENANCE" : "AVAILABLE",
      photoPath: `${item.patrimonio}/${(index + 1).toString(16).padStart(64, "0")}.webp`,
    })),
  });
  const path = `TI-0001/${"1".padStart(64, "0")}.webp`;
  await page.route("**/storage/v1/object/public/equipamentos/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="navy"/></svg>',
    }),
  );
  await page.goto("/catalogo");
  await expect(
    page.getByText("12 equipamentos · 9 disponíveis agora"),
  ).toBeVisible();
  await expect(page.locator("img[src*='/equipamentos/TI-']")).toHaveCount(12);
  await expect(page.locator('a[href="/catalogo/TI-0010"]')).toHaveCount(0);
  const image = page.getByRole("img", { name: inventory[0].nome, exact: true });
  await expect(image).toHaveAttribute(
    "src",
    new RegExp(`/storage/v1/object/public/equipamentos/${path}$`),
  );
  await expect
    .poll(() => image.evaluate((el) => (el as HTMLImageElement).naturalWidth))
    .toBe(800);
  await expect(image).toHaveAttribute("height", "600");
  await expect(
    page.getByRole("link", { name: "Fotos: Pexels" }),
  ).toHaveAttribute("href", "https://www.pexels.com/");
});
test("spec 003 test_ca_03 sexto empréstimo fica indisponível com motivo visível", async ({
  page,
}) => {
  await connect(page);
  for (let index = 1; index <= 5; index++) {
    const item = await env.db.equipment.create({
      data: {
        tenantId: f.tenant.id,
        name: `Item ${index}`,
        patrimony: `PAT-LIM-${index}`,
        category: "MONITOR",
      },
    });
    await f.caller.loans.request({ id: item.id });
  }
  await page.goto(`/catalogo/${f.equipment.patrimony}`);
  await expect(
    page.getByRole("button", { name: "Solicitar empréstimo" }),
  ).toBeDisabled();
  await expect(page.getByText(/Limite de 5 itens atingido/)).toBeVisible();
  expect((await f.caller.loans.mine()).openCount).toBe(5);
});
test("test_ca_02_ca_05_ca_07_ca_08 fluxo completo persiste e exige confirmação", async ({
  page,
}) => {
  await connect(page);
  await page.goto("/catalogo");
  await page.getByRole("link").filter({ hasText: 'MacBook Pro 14"' }).click();
  await expect(
    page.getByRole("heading", { name: "Solicitar empréstimo" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Solicitar empréstimo", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("14 dias úteis");
  expect(
    await page
      .getByRole("dialog")
      .evaluate((el) => getComputedStyle(el).animationDuration),
  ).toBe("0.18s");
  await page
    .getByRole("button", { name: "Confirmar empréstimo", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Comigo agora" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Solicitar devolução" }).click();
  await expect(
    page.getByText("Aguardando Operações", { exact: true }),
  ).toBeVisible();
  expect(await env.db.loan.count({ where: { returnedAt: null } })).toBe(1);
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Empréstimos em aberto" })
    .click();
  await page
    .getByRole("button", { name: "Confirmar devolução", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Devolução confirmada" }),
  ).toBeVisible();
  expect(await env.db.loan.count({ where: { returnedAt: null } })).toBe(0);
});
test("test_ca_03_exemplos só com consulta vazia e erro não é exemplo", async ({
  page,
}) => {
  await env.db.equipment.deleteMany();
  await connect(page);
  await page.goto("/catalogo");
  await expect(
    page.getByText("Dados de exemplo para conhecer as telas.", {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByRole("link").filter({ hasText: 'MacBook Pro 14"' }).click();
  await expect(
    page.getByRole("button", { name: "Solicitar empréstimo", exact: true }),
  ).toBeDisabled();
  expect(await env.db.loan.count()).toBe(0);
});
test("test_ca_04_ca_06 bloqueios aparecem na interface", async ({ page }) => {
  await env.db.loan.create({
    data: {
      tenantId: f.tenant.id,
      userId: f.user.id,
      equipmentId: f.equipment.id,
      borrowedAt: new Date("2026-01-01"),
      dueDate: new Date("2026-01-15"),
    },
  });
  const available = await env.db.equipment.create({
    data: {
      tenantId: f.tenant.id,
      name: "Monitor disponível",
      patrimony: "PAT-5000",
      category: "MONITOR",
    },
  });
  await env.db.equipment.create({
    data: {
      tenantId: f.tenant.id,
      name: "Monitor em manutenção",
      patrimony: "PAT-5001",
      category: "MONITOR",
      status: "MAINTENANCE",
    },
  });
  await connect(page);
  await page.goto("/catalogo");
  const maintenance = page
    .getByRole("article")
    .filter({ hasText: "Monitor em manutenção" });
  await expect(maintenance).toContainText("Em manutenção");
  await expect(maintenance.getByRole("link")).toHaveCount(0);
  await page.goto(`/catalogo/${available.patrimony}`);
  await expect(
    page.getByRole("button", { name: "Solicitar empréstimo", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByText("Você tem item em atraso.", { exact: false }),
  ).toBeVisible();
});
test("test_ca_09_ca_11 cadastro por member e prévia reativa", async ({
  page,
}) => {
  await connect(page);
  await page.goto("/operacoes/equipamentos/novo");
  await page.getByLabel("Nome do equipamento").fill("Projetor de reunião");
  await page.getByLabel("Categoria", { exact: true }).selectOption("PROJECTOR");
  await page.getByLabel("Patrimônio", { exact: true }).fill("PAT-8000");
  await expect(page.getByRole("article")).toContainText("Projetor de reunião");
  await expect(page.getByRole("article")).toContainText("PAT-8000");
  await page.getByRole("button", { name: "Cadastrar", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "cadastrado" }),
  ).toBeVisible();
  expect(
    await env.db.equipment.count({
      where: { patrimony: "PAT-8000", tenantId: f.tenant.id },
    }),
  ).toBe(1);
});
test("test_ca_10_filtros e paginação do navegador usam cursor", async ({
  page,
}) => {
  for (let i = 0; i < 9; i++) {
    const equipment = await env.db.equipment.create({
      data: {
        tenantId: f.tenant.id,
        name: `Equipamento ${i}`,
        patrimony: `PAT-600${i}`,
        category: "MONITOR",
      },
    });
    await env.db.loan.create({
      data: {
        tenantId: f.tenant.id,
        userId: f.user.id,
        equipmentId: equipment.id,
        borrowedAt: new Date("2026-01-01"),
        dueDate: new Date("2026-01-15"),
      },
    });
  }
  await connect(page);
  await page.goto("/operacoes/emprestimos");
  await expect(page.getByText("1–7 de 9 empréstimos")).toBeVisible();
  await page.getByRole("button", { name: "Próximo", exact: true }).click();
  await expect(page.getByText("8–9 de 9 empréstimos")).toBeVisible();
  await page.getByLabel("Buscar empréstimos").fill("Equipamento 3");
  await expect(page.getByText("1–1 de 1 empréstimos")).toBeVisible();
});
test("test_ca_12_telas tema foco movimento e adaptação móvel", async ({
  page,
}) => {
  await connect(page);
  for (const path of [
    "/catalogo",
    "/catalogo/PAT-1042",
    "/meus-emprestimos",
    "/operacoes/emprestimos",
    "/operacoes/equipamentos/novo",
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page
        .locator("html")
        .evaluate((el) => getComputedStyle(el).colorScheme),
    ).toBe("dark");
    const header = page.locator("header");
    if (path === "/catalogo") {
      await expect(header.getByLabel("Buscar equipamento")).toBeVisible();
      await expect(
        header.getByRole("button", { name: "Notificações" }),
      ).toBeDisabled();
      await expect(
        page.locator(
          'nav[aria-label="Navegação principal"] [aria-current="page"] .ph-fill',
        ),
      ).toBeVisible();
      const filter = page.getByRole("button", { name: "Todos", exact: true });
      await expect(
        page.getByText("1 equipamento · 1 disponível agora", { exact: true }),
      ).toBeVisible();
      await expect(filter).toHaveAttribute("aria-pressed", "true");
      await expect(filter).toHaveCSS("border-top-color", "rgb(37, 64, 143)");
      await expect(filter).toHaveCSS("padding-top", "6px");
      const rules = page
        .getByRole("status")
        .filter({ hasText: "Equipamento certo, na hora certa." });
      await expect(rules).toHaveCSS("padding-top", "13px");
      await expect(rules).toHaveCSS(
        "background-image",
        "linear-gradient(90deg, rgb(14, 21, 48), rgb(11, 17, 40))",
      );
      await filter.hover();
      await page.mouse.down();
      await expect(filter).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 1)");
      await page.mouse.up();
    } else if (path === "/operacoes/emprestimos") {
      await expect(header.getByLabel("Buscar empréstimos")).toBeVisible();
      await expect(
        header.getByRole("link", { name: "Cadastrar equipamento" }),
      ).toBeVisible();
    } else {
      await expect(
        header.getByRole("navigation", { name: "Breadcrumb" }),
      ).toBeVisible();
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/catalogo");
  await expect(
    page.getByRole("navigation", { name: "Navegação móvel" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByLabel("Buscar equipamento").focus();
  expect(
    await page
      .getByLabel("Buscar equipamento")
      .evaluate((el) => getComputedStyle(el).outlineStyle),
  ).not.toBe("none");
  await expect(page.getByLabel("Buscar equipamento")).toHaveCSS(
    "outline-offset",
    "2px",
  );
  expect(
    await page
      .getByRole("button", { name: "Todos", exact: true })
      .evaluate((el) =>
        getComputedStyle(el)
          .transitionDuration.split(",")
          .every((value) => parseFloat(value) === 0),
      ),
  ).toBe(true);
  const filter = page.getByRole("button", { name: "Todos", exact: true });
  await filter.hover();
  await page.mouse.down();
  await expect(filter).toHaveCSS("transform", "none");
  await page.mouse.up();
  await page.screenshot({
    path: "test-results/catalogo-mobile.png",
    fullPage: true,
  });
});
test("test_ca_12_csrf rejeita mutação de outra origem", async ({ request }) => {
  const response = await request.post("/api/trpc/auth.login", {
    headers: { Origin: "https://outro-site.example" },
    data: {},
  });
  expect(response.status()).toBe(403);
});

test("test_ca_03_erro_de_api não é tratado como catálogo vazio", async ({
  page,
}) => {
  await connect(page);
  await page.route(/\/api\/trpc\/.*equipment\.list/, (route) => route.abort());
  await page.goto("/catalogo");
  await expect(page.locator("main [role=alert]")).toBeVisible();
  await expect(
    page.getByText("Dados de exemplo para conhecer as telas.", {
      exact: false,
    }),
  ).toHaveCount(0);
});

test("test_ca_10_confirmar última linha da segunda página corrige o índice", async ({
  page,
}) => {
  for (let i = 0; i < 8; i++) {
    const equipment = await env.db.equipment.create({
      data: {
        tenantId: f.tenant.id,
        name: `Equipamento ${i}`,
        patrimony: `PAT-700${i}`,
        category: "MONITOR",
      },
    });
    await env.db.loan.create({
      data: {
        tenantId: f.tenant.id,
        userId: f.user.id,
        equipmentId: equipment.id,
        borrowedAt: new Date("2026-01-01"),
        dueDate: new Date("2026-01-15"),
        returnRequestedAt: new Date(),
      },
    });
  }
  await connect(page);
  await page.goto("/operacoes/emprestimos");
  await page.getByRole("button", { name: "Próximo", exact: true }).click();
  await expect(page.getByText("8–8 de 8 empréstimos")).toBeVisible();
  await page
    .getByRole("button", { name: "Confirmar devolução", exact: true })
    .click();
  await expect(page.getByText("1–7 de 7 empréstimos")).toBeVisible();
  await page.getByRole("button", { name: "Notebooks", exact: true }).click();
  await expect(page.getByText("0–0 de 0 empréstimos")).toBeVisible();
});
