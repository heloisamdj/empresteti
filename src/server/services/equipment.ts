import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import type { z } from "zod";
import type { TenantDb } from "../db";
import { equipmentInput, listInput, patrimonyInput } from "@/lib/contracts";
import type { Identity } from "../auth";

export async function listEquipment(
  db: TenantDb,
  input: z.infer<typeof listInput>,
) {
  const where: Prisma.EquipmentWhereInput = {
    status: input.availableOnly
      ? "AVAILABLE"
      : input.order === "recent"
        ? undefined
        : { not: "OUT_OF_SERVICE" },
    category: input.category,
    ...(input.availableOnly ? { loans: { none: { returnedAt: null } } } : {}),
    OR: [
      { name: { contains: input.search, mode: "insensitive" } },
      { patrimony: { contains: input.search, mode: "insensitive" } },
    ],
  };
  const [rows, total, availableCount] = await Promise.all([
    db.equipment.findMany({
      where,
      orderBy:
        input.order === "recent"
          ? [{ createdAt: "desc" }, { id: "desc" }]
          : { id: "asc" },
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      include: {
        loans: {
          where: { returnedAt: null },
          include: { user: { select: { name: true } } },
        },
      },
    }),
    db.equipment.count({ where }),
    db.equipment.count({
      where: {
        ...where,
        status: "AVAILABLE",
        loans: { none: { returnedAt: null } },
      },
    }),
  ]);
  const more = rows.length > input.limit;
  if (more) rows.pop();
  return {
    items: rows,
    total,
    availableCount,
    nextCursor: more ? rows.at(-1)?.id : undefined,
  };
}
export async function equipmentDetail(
  db: TenantDb,
  input: z.infer<typeof patrimonyInput>,
) {
  const item = await db.equipment.findFirst({
    where: { patrimony: input.patrimony, status: { not: "OUT_OF_SERVICE" } },
    include: {
      loans: {
        orderBy: [{ borrowedAt: "desc" }, { id: "desc" }],
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        include: { user: { select: { name: true } } },
      },
    },
  });
  if (!item)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Equipamento não encontrado.",
    });
  const more = item.loans.length > input.limit;
  if (more) item.loans.pop();
  const activeLoan = await db.loan.findFirst({
    where: { equipmentId: item.id, returnedAt: null },
  });
  return {
    ...item,
    activeLoan,
    nextCursor: more ? item.loans.at(-1)?.id : undefined,
  };
}
export async function createEquipment(
  db: TenantDb,
  identity: Identity,
  data: z.infer<typeof equipmentInput>,
) {
  try {
    return await db.$transaction(async (tx) => {
      const item = await tx.equipment.create({
        data: { ...data, tenantId: identity.tenantId },
      });
      await tx.auditLog.create({
        data: {
          tenantId: identity.tenantId,
          actorUserId: identity.id,
          action: "equipment.create",
          resourceType: "equipment",
          resourceId: item.id,
        },
      });
      return item;
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      throw new TRPCError({
        code: "CONFLICT",
        message: "Este patrimônio já está cadastrado.",
      });
    throw error;
  }
}
