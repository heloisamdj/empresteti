import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import { checkDatabase } from "../services/session";
import { authRouter } from "./routers/auth";
import { equipmentRouter } from "./routers/equipment";
import { loansRouter } from "./routers/loans";
export const appRouter = router({
  health: publicProcedure
    .input(z.void())
    .query(({ ctx }) => checkDatabase(ctx.prisma)),
  auth: authRouter,
  equipment: equipmentRouter,
  loans: loansRouter,
});
export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
