import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure, tenantProcedure } from "../trpc";
import { loginInput } from "@/lib/contracts";
import { enforceLoginLimit } from "../../services/session";
import { findIdentity } from "../../services/identity";
export const authRouter = router({
  session: publicProcedure.input(z.void()).query(({ ctx }) => ctx.identity),
  login: publicProcedure.input(loginInput).mutation(async ({ ctx, input }) => {
    if (!ctx.auth)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "Autenticação indisponível. Confira a configuração do servidor.",
      });
    await enforceLoginLimit(ctx.prisma, ctx.ip, input.email);
    const { data, error } = await ctx.auth.auth.signInWithPassword(input);
    if (error || !data.user)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "E-mail ou senha inválidos.",
      });
    const identity = await findIdentity(data.user.id, ctx.prisma);
    if (!identity) {
      await ctx.auth.auth.signOut();
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "Conta sem vínculo com a equipe. Solicite o convite e a liberação a Operações.",
      });
    }
    return identity;
  }),
  logout: tenantProcedure.input(z.void()).mutation(async ({ ctx }) => {
    if (ctx.auth) {
      const { error } = await ctx.auth.auth.signOut();
      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Não foi possível encerrar a sessão. Tente novamente.",
        });
    }
    return { ok: true };
  }),
});
