import { prisma } from "../db";
export async function findIdentity(authUserId: string, database = prisma) {
  const user = await database.user.findUnique({
    where: { authUserId },
    include: {
      memberships: { orderBy: { createdAt: "asc" }, include: { tenant: true } },
    },
  });
  const membership = user?.memberships[0];
  return user && membership
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        tenantId: membership.tenantId,
        tenantName: membership.tenant.name,
        role: membership.role,
      }
    : null;
}
export type Identity = NonNullable<Awaited<ReturnType<typeof findIdentity>>>;
