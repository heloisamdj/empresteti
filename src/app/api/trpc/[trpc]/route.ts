import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/api/root";
import { createAuthClient, findIdentity } from "@/server/auth";
import { prisma } from "@/server/db";
import { captureException } from "@sentry/node";

export const dynamic = "force-dynamic";
async function handler(req: Request) {
  const origin = req.headers.get("origin");
  if (req.method === "POST" && origin && origin !== new URL(req.url).origin)
    return new Response("Origem não permitida.", { status: 403 });
  const requestId = crypto.randomUUID();
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const auth = await createAuthClient();
      const { data } = await auth.auth.getUser();
      const identity = data.user ? await findIdentity(data.user.id) : null;
      return {
        prisma,
        auth,
        identity,
        requestId,
        ip:
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown",
      };
    },
    onError({ error, path, ctx }) {
      console.error(
        JSON.stringify({
          request_id: requestId,
          tenant_id: ctx?.identity?.tenantId,
          procedure: path,
          code: error.code,
        }),
      );
      if (process.env.SENTRY_DSN && error.code === "INTERNAL_SERVER_ERROR")
        captureException(error, {
          tags: { request_id: requestId, tenant_id: ctx?.identity?.tenantId },
        });
    },
  });
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Request-ID", requestId);
  return response;
}
export { handler as GET, handler as POST };
