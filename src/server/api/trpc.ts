import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { prisma, scopeToTenant } from "../db";
import type { Identity, createAuthClient } from "../auth";

export type Context = {
  prisma: typeof prisma;
  identity: Identity | null;
  auth: Awaited<ReturnType<typeof createAuthClient>> | null;
  requestId: string;
  ip: string;
};
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      ...(error.code === "INTERNAL_SERVER_ERROR"
        ? {
            message:
              "Não foi possível concluir. Verifique a configuração e tente novamente.",
          }
        : {}),
      data: {
        ...shape.data,
        stack:
          process.env.NODE_ENV === "production" ? undefined : shape.data.stack,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.identity)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Entre para continuar.",
    });
  return next({ ctx: { ...ctx, identity: ctx.identity } });
});
export const tenantProcedure = protectedProcedure.use(({ ctx, next }) =>
  next({
    ctx: { ...ctx, db: scopeToTenant(ctx.prisma, ctx.identity.tenantId) },
  }),
);
export const adminProcedure = tenantProcedure.use(({ ctx, next }) => {
  if (ctx.identity.role !== "ADMIN")
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Ação restrita à administração.",
    });
  return next({ ctx });
});
