import { PrismaClient, Prisma } from "@prisma/client";

const globalDb = globalThis as unknown as { emprestiPrisma?: PrismaClient };
export const prisma = globalDb.emprestiPrisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalDb.emprestiPrisma = prisma;

// Nunca recebe tenant do input. A extensão é criada pelo middleware autenticado.
export function scopeToTenant(client: PrismaClient, tenantId: string) {
  return client.$extends({
    name: "tenant-isolation",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!["Equipment", "Loan", "AuditLog", "Membership"].includes(model))
            return query(args);
          const scoped = args as unknown as {
            where?: Prisma.EquipmentWhereInput;
            data?: Record<string, unknown>;
          };
          if (
            [
              "findMany",
              "findFirst",
              "findFirstOrThrow",
              "findUnique",
              "findUniqueOrThrow",
              "count",
              "aggregate",
              "groupBy",
              "update",
              "updateMany",
              "delete",
              "deleteMany",
            ].includes(operation)
          ) {
            scoped.where = {
              ...scoped.where,
              AND: [scoped.where ?? {}, { tenantId }],
            };
          } else if (operation === "create") {
            scoped.data = { ...scoped.data, tenantId };
          } else {
            throw new Error(
              `Operação ${operation} indisponível no acesso de domínio.`,
            );
          }
          return query(args);
        },
      },
    },
  });
}
export type TenantDb = ReturnType<typeof scopeToTenant>;
