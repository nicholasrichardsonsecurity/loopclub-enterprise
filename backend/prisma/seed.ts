import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Trava de segurança: seed permitido exclusivamente em development ou test.
const allowedEnvironments = ['development', 'test'];

if (!allowedEnvironments.includes(process.env.NODE_ENV ?? '')) {
  console.error('[Seed] ERRO: seed permitido somente com NODE_ENV=development ou NODE_ENV=test.');
  process.exit(1);
}

const prisma = new PrismaClient();

const SEED_USERS: { name: string; email: string; role: UserRole }[] = [
  { name: 'Admin Teste',    email: 'admin.rbac@loopclub.dev',    role: UserRole.admin },
  { name: 'Owner Teste',    email: 'owner.rbac@loopclub.dev',    role: UserRole.company_owner },
  { name: 'Employee Teste', email: 'employee.rbac@loopclub.dev', role: UserRole.employee },
  { name: 'Client Teste',   email: 'client.rbac@loopclub.dev',   role: UserRole.client },
];

async function main() {
  const seedPassword = process.env.RBAC_SEED_PASSWORD;
  if (!seedPassword) {
    console.error('[Seed] ERRO: Variável RBAC_SEED_PASSWORD não definida.');
    console.error('[Seed] Defina RBAC_SEED_PASSWORD no .env para uso local de desenvolvimento.');
    console.error('[Seed] Aviso: nunca reutilize esta senha em produção.');
    process.exit(1);
  }

  console.log('[Seed] Iniciando seed de desenvolvimento RBAC...');
  console.log('[Seed] Modo:', process.env.NODE_ENV);

  const passwordHash = await bcrypt.hash(seedPassword, 10);

  for (const user of SEED_USERS) {
    const result = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
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
