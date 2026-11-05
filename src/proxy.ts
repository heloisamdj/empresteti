import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const dev = process.env.NODE_ENV !== "production";
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const policy = `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}; style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com https://unpkg.com; font-src 'self' https://fonts.gstatic.com https://unpkg.com; img-src 'self' data:; connect-src 'self'${dev ? " ws://localhost:* ws://127.0.0.1:*" : ""}; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'`;
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", policy);
  let response = NextResponse.next({ request: { headers } });
  if (
    request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-")) &&
    supabaseUrl &&
    supabaseKey
  ) {
    const auth = createServerClient(supabaseUrl, supabaseKey, {
      cookieOptions: { httpOnly: true, secure: !dev, sameSite: "lax" },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (values) => {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers } });
          values.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, { ...options, httpOnly: true }),
          );
        },
      },
    });
    await auth.auth.getUser();
  }
  response.headers.set("Content-Security-Policy", policy);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
