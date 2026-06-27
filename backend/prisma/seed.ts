import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SEED_USERS = [
  {
    name: 'Admin Teste',
    email: 'admin.rbac@loopclub.dev',
    role: UserRole.admin,
    password: 'SenhaTeste@123',
  },
  {
    name: 'Owner Teste',
    email: 'owner.rbac@loopclub.dev',
    role: UserRole.company_owner,
    password: 'SenhaTeste@123',
  },
  {
    name: 'Employee Teste',
    email: 'employee.rbac@loopclub.dev',
    role: UserRole.employee,
    password: 'SenhaTeste@123',
  },
  {
    name: 'Client Teste',
    email: 'client.rbac@loopclub.dev',
    role: UserRole.client,
    password: 'SenhaTeste@123',
  },
];

async function main() {
  console.log('[Seed] Iniciando seed de desenvolvimento RBAC...');

  for (const user of SEED_USERS) {
    const passwordHash = await bcrypt.hash(user.password, 10);

    const result = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        passwordHash,
        status: 'active',
      },
      create: {
        name: user.name,
        email: user.email,
        role: user.role,
        passwordHash,
        status: 'active',
      },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    console.log(`[Seed] Usuário: ${result.email} — ${result.role} (${result.status})`);
  }

  console.log('[Seed] Seed concluído com sucesso.');
}

main()
  .catch((e) => {
    console.error('[Seed] Erro:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
