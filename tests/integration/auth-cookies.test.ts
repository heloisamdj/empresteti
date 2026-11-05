import { afterEach, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
const store = vi.hoisted(
  () => new Map<string, { value: string; options: Record<string, unknown> }>(),
);
vi.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () =>
      [...store].map(([name, cookie]) => ({ name, value: cookie.value })),
    set: (name: string, value: string, options: Record<string, unknown>) =>
      store.set(name, { value, options }),
  }),
}));
import { createAuthClient } from "../../src/server/auth";
afterEach(() => {
  store.clear();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
it("test_ca_01_adapter SSR guarda sessão em httpOnly e valida usuário no provedor", async () => {
  vi.stubEnv(
    "DATABASE_URL",
    "postgresql://test:test@127.0.0.1:5433/empresti_test",
  );
  vi.stubEnv("SUPABASE_URL", "https://supabase-auth.example.test");
  vi.stubEnv("SUPABASE_ANON_KEY", "test-public-key");
  const user = {
    id: randomUUID(),
    aud: "authenticated",
    role: "authenticated",
    email: "marina@example.test",
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
  };
  const now = Math.floor(Date.now() / 1000);
  const token = [
    { alg: "HS256", typ: "JWT" },
    {
      sub: user.id,
      aud: "authenticated",
      role: "authenticated",
      exp: now + 3600,
      iat: now,
      iss: "https://supabase-auth.example.test/auth/v1",
      session_id: randomUUID(),
    },
    "test-signature",
  ]
    .map((part, i) =>
      i === 2
        ? String(part)
        : Buffer.from(JSON.stringify(part)).toString("base64url"),
    )
    .join(".");
  const fetcher = vi.fn(
    async (input: RequestInfo | URL) =>
      new Response(
        JSON.stringify(
          String(input).includes("/token")
            ? {
                access_token: token,
                refresh_token: "test-refresh",
                expires_in: 3600,
                token_type: "bearer",
                user,
              }
            : user,
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
  );
  vi.stubGlobal("fetch", fetcher);
  const auth = await createAuthClient();
  const signed = await auth.auth.signInWithPassword({
    email: user.email,
    password: "test",
  });
  expect(signed.error).toBeNull();
  const sessionCookies = [...store.values()].filter((cookie) => cookie.value);
  expect(sessionCookies.length).toBeGreaterThan(0);
  expect(
    sessionCookies.every((cookie) => cookie.options.httpOnly === true),
  ).toBe(true);
  expect(
    sessionCookies.every((cookie) => cookie.options.sameSite === "lax"),
  ).toBe(true);
  const nextRequest = await createAuthClient();
  expect((await nextRequest.auth.getUser()).data.user?.id).toBe(user.id);
  expect(
    fetcher.mock.calls.some(([url]) => String(url).includes("/user")),
  ).toBe(true);
  await nextRequest.auth.signOut();
  expect([...store.values()].every((cookie) => !cookie.value)).toBe(true);
});
