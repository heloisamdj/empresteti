import { defineConfig } from "@playwright/test";

// A URL é usada pelo worker e pelo Next para as imagens interceptadas no teste.
process.env.SUPABASE_URL = "https://emprestifotosfixture.supabase.co";

export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  expect: { timeout: 20000 },
  timeout: 60000,
  use: {
    reducedMotion: "no-preference",
    baseURL: "http://127.0.0.1:3000",
    ...(process.platform === "win32" ? { channel: "msedge" } : {}),
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1",
    url: "http://127.0.0.1:3000/login",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
