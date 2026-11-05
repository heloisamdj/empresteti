import { PrismaClient } from "@prisma/client";

const [authUserId, email, name] = process.argv.slice(2);
if (!authUserId || !email || !name)
  throw new Error(
    'Uso: npm run db:provision -- <id-do-usuario-convidado-no-Supabase> <email> "Nome"',
  );
const prisma = new PrismaClient();
try {
  const tenant = await prisma.tenant.findUniqueOrThrow({
    where: { slug: "suporte_ti" },
  });
  const user = await prisma.user.upsert({
    where: { email },
    update: { authUserId, name },
    create: { authUserId, email, name },
  });
  await prisma.membership.upsert({
    where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } },
    update: {},
    create: { userId: user.id, tenantId: tenant.id, role: "MEMBER" },
  });
  console.log(
    "Vínculo criado no banco local. Nenhuma conta remota foi criada ou alterada.",
  );
} finally {
  await prisma.$disconnect();
}
