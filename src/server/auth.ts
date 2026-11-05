import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { authEnvironment } from "./env";
export { findIdentity } from "./services/identity";
export type { Identity } from "./services/identity";

export async function createAuthClient() {
  const env = authEnvironment();
  const store = await cookies();
  return createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
    cookies: {
      getAll: () => store.getAll(),
      setAll: (values) => {
        values.forEach(({ name, value, options }) =>
          store.set(name, value, { ...options, httpOnly: true }),
        );
      },
    },
  });
}
