import { router, tenantProcedure } from "../trpc";
import { equipmentInput, listInput, patrimonyInput } from "@/lib/contracts";
import {
  listEquipment,
  equipmentDetail,
  createEquipment,
} from "../../services/equipment";
export const equipmentRouter = router({
  list: tenantProcedure
    .input(listInput)
    .query(({ ctx, input }) => listEquipment(ctx.db, input)),
  detail: tenantProcedure
    .input(patrimonyInput)
    .query(({ ctx, input }) => equipmentDetail(ctx.db, input)),
  create: tenantProcedure
    .input(equipmentInput)
    .mutation(({ ctx, input }) => createEquipment(ctx.db, ctx.identity, input)),
});
