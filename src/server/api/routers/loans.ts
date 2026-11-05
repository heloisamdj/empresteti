import { router, tenantProcedure } from "../trpc";
import { idInput, operationsInput, paginationInput } from "@/lib/contracts";
import {
  myLoans,
  requestLoan,
  requestReturn,
  confirmReturn,
  operations,
} from "../../services/loans";
export const loansRouter = router({
  mine: tenantProcedure
    .input(paginationInput)
    .query(({ ctx, input }) => myLoans(ctx.db, ctx.identity, input)),
  request: tenantProcedure
    .input(idInput)
    .mutation(({ ctx, input }) => requestLoan(ctx.db, ctx.identity, input.id)),
  requestReturn: tenantProcedure
    .input(idInput)
    .mutation(({ ctx, input }) =>
      requestReturn(ctx.db, ctx.identity, input.id),
    ),
  confirmReturn: tenantProcedure
    .input(idInput)
    .mutation(({ ctx, input }) =>
      confirmReturn(ctx.db, ctx.identity, input.id),
    ),
  operations: tenantProcedure
    .input(operationsInput)
    .query(({ ctx, input }) => operations(ctx.db, input)),
});
