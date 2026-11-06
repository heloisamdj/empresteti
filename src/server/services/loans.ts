import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type { z } from "zod";
import type { TenantDb } from "../db";
import type { Identity } from "../auth";
import { MAX_ITEMS, operationsInput, paginationInput } from "@/lib/contracts";
import { loanDeadline } from "./loan-deadline";

export async function myLoans(
  db: TenantDb,
  identity: Identity,
  input: z.infer<typeof paginationInput>,
) {
  const items = await db.loan.findMany({
    where: { userId: identity.id, returnedAt: { not: null } },
    include: { equipment: true },
    orderBy: [{ borrowedAt: "desc" }, { id: "desc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  const open = await db.loan.findMany({
    where: { userId: identity.id, returnedAt: null },
    include: { equipment: true },
    orderBy: { borrowedAt: "desc" },
  });
  const more = items.length > input.limit;
  if (more) items.pop();
  const serverNow = new Date();
  return {
    items,
    openItems: open,
    nextCursor: more ? items.at(-1)?.id : undefined,
    openCount: open.length,
    overdue: open.some((item) => item.dueDate < serverNow),
    maxItems: MAX_ITEMS,
    serverNow,
    expectedDueDate: loanDeadline(serverNow),
  };
}
export async function requestLoan(
  db: TenantDb,
  identity: Identity,
  equipmentId: string,
) {
  try {
    return await db.$transaction(async (tx) => {
      // Locks serialize requests by person and physical unit, including different users.
      await tx.$queryRaw`SELECT id FROM memberships WHERE user_id=${identity.id}::uuid AND tenant_id=${identity.tenantId}::uuid FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM equipments WHERE id=${equipmentId}::uuid AND tenant_id=${identity.tenantId}::uuid FOR UPDATE`;
      const item = await tx.equipment.findFirst({ where: { id: equipmentId } });
      if (!item)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Equipamento não encontrado.",
        });
      if (item.status !== "AVAILABLE")
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Equipamento indisponível para empréstimo.",
        });
      const open = await tx.loan.findMany({
        where: { userId: identity.id, returnedAt: null },
      });
      if (open.length >= MAX_ITEMS)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Limite de ${MAX_ITEMS} itens atingido.`,
        });
      const now = new Date();
      if (open.some((loan) => loan.dueDate < now))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Regularize o item em atraso antes de solicitar outro.",
        });
      if (await tx.loan.findFirst({ where: { equipmentId, returnedAt: null } }))
        throw new TRPCError({
          code: "CONFLICT",
          message: "Este equipamento já foi emprestado.",
        });
      const loan = await tx.loan.create({
        data: {
          tenantId: identity.tenantId,
          userId: identity.id,
          equipmentId,
          borrowedAt: now,
          dueDate: loanDeadline(now),
        },
      });
      await tx.auditLog.create({
        data: {
          tenantId: identity.tenantId,
          actorUserId: identity.id,
          action: "loan.request",
          resourceType: "loan",
          resourceId: loan.id,
        },
      });
      return loan;
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      throw new TRPCError({
        code: "CONFLICT",
        message: "Este equipamento acabou de ser emprestado.",
      });
    throw error;
  }
}
export async function requestReturn(
  db: TenantDb,
  identity: Identity,
  id: string,
) {
  return db.$transaction(async (tx) => {
    const loan = await tx.loan.findFirst({
      where: { id, userId: identity.id, returnedAt: null },
    });
    if (!loan)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Empréstimo aberto não encontrado.",
      });
    if (loan.returnRequestedAt) return loan;
    const updated = await tx.loan.update({
      where: { id },
      data: { returnRequestedAt: new Date() },
    });
    await tx.auditLog.create({
      data: {
        tenantId: identity.tenantId,
        actorUserId: identity.id,
        action: "loan.return.request",
        resourceType: "loan",
        resourceId: id,
      },
    });
    return updated;
  });
}
export async function confirmReturn(
  db: TenantDb,
  identity: Identity,
  id: string,
) {
  return db.$transaction(async (tx) => {
    const loan = await tx.loan.findFirst({
      where: { id, returnedAt: null, returnRequestedAt: { not: null } },
    });
    if (!loan)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Solicitação de devolução pendente não encontrada.",
      });
    const changed = await tx.loan.updateMany({
      where: { id, returnedAt: null },
      data: { returnedAt: new Date() },
    });
    if (!changed.count)
      throw new TRPCError({
        code: "CONFLICT",
        message: "Devolução já confirmada.",
      });
    await tx.auditLog.create({
      data: {
        tenantId: identity.tenantId,
        actorUserId: identity.id,
        action: "loan.return.confirm",
        resourceType: "loan",
        resourceId: id,
      },
    });
    return { id };
  });
}
export async function operations(
  db: TenantDb,
  input: z.infer<typeof operationsInput>,
) {
  const now = new Date();
  const where: Prisma.LoanWhereInput = {
    returnedAt: null,
    ...(input.filter === "late" ? { dueDate: { lt: now } } : {}),
    ...(input.filter === "week"
      ? { dueDate: { gte: now, lte: new Date(now.getTime() + 7 * 86400000) } }
      : {}),
    ...(input.filter === "pending" ? { returnRequestedAt: { not: null } } : {}),
    equipment: { category: input.category },
    OR: [
      { equipment: { name: { contains: input.search, mode: "insensitive" } } },
      {
        equipment: {
          patrimony: { contains: input.search, mode: "insensitive" },
        },
      },
      { user: { name: { contains: input.search, mode: "insensitive" } } },
    ],
  };
  const [rows, total, open, late, maintenance, pending, dueSoon] =
    await Promise.all([
      db.loan.findMany({
        where,
        orderBy: { id: "asc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        include: {
          equipment: true,
          user: { select: { name: true, department: true } },
        },
      }),
      db.loan.count({ where }),
      db.loan.count({ where: { returnedAt: null } }),
      db.loan.count({ where: { returnedAt: null, dueDate: { lt: now } } }),
      db.equipment.count({ where: { status: "MAINTENANCE" } }),
      db.loan.count({
        where: { returnedAt: null, returnRequestedAt: { not: null } },
      }),
      db.loan.count({
        where: {
          returnedAt: null,
          dueDate: { gte: now, lte: new Date(now.getTime() + 3 * 86400000) },
        },
      }),
    ]);
  const more = rows.length > input.limit;
  if (more) rows.pop();
  return {
    items: rows,
    total,
    nextCursor: more ? rows.at(-1)?.id : undefined,
    stats: { open, late, maintenance, pending, dueSoon },
    serverNow: now,
  };
}
