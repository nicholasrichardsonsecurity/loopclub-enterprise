import { PrismaClient, UserRole, CompanyUserRole, CompanyStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Trava de segurança: seed permitido exclusivamente em development ou test.
const allowedEnvironments = ['development', 'test'];

if (!allowedEnvironments.includes(process.env.NODE_ENV ?? '')) {
  console.error('[Seed] ERRO: seed permitido somente com NODE_ENV=development ou NODE_ENV=test.');
  process.exit(1);
}

const prisma = new PrismaClient();

// CNPJs com dígitos verificadores matematicamente válidos — uso exclusivo em development/test
const CNPJ_ALPHA = '00000000000191';
const CNPJ_BETA  = '00000000000272';
const CNPJ_MULTI = '00000000000353';

interface SeedUser {
  name: string;
  email: string;
  role: UserRole;
}

const SEED_USERS: SeedUser[] = [
  { name: 'Admin Teste',         email: 'admin.rbac@loopclub.dev',             role: UserRole.admin },
  { name: 'Owner Alpha',         email: 'owner.rbac@loopclub.dev',             role: UserRole.company_owner },
  { name: 'Employee Alpha',      email: 'employee.rbac@loopclub.dev',          role: UserRole.employee },
  { name: 'Client Teste',        email: 'client.rbac@loopclub.dev',            role: UserRole.client },
  { name: 'Owner Beta',          email: 'owner.beta@loopclub.dev',             role: UserRole.company_owner },
  { name: 'Multi Company Test',  email: 'multi.company@loopclub.dev',          role: UserRole.company_owner },
  { name: 'Unlinked Owner',      email: 'unlinked.owner@loopclub.dev',         role: UserRole.company_owner },
];

interface SeedCompany {
  name: string;
  document: string;
  category: string;
  status: CompanyStatus;
}

const SEED_COMPANIES: SeedCompany[] = [
  { name: 'Empresa Alpha', document: CNPJ_ALPHA, category: 'acai', status: CompanyStatus.active },
  { name: 'Empresa Beta',  document: CNPJ_BETA,  category: 'restaurante', status: CompanyStatus.active },
  { name: 'Empresa Multi', document: CNPJ_MULTI, category: 'barbearia', status: CompanyStatus.active },
];

interface SeedCompanyUser {
  userEmail: string;
  companyDocument: string;
  role: CompanyUserRole;
}

const SEED_COMPANY_USERS: SeedCompanyUser[] = [
  // Owner Alpha → Empresa Alpha (owner)
  { userEmail: 'owner.rbac@loopclub.dev',    companyDocument: CNPJ_ALPHA, role: CompanyUserRole.owner },
  // Employee Alpha → Empresa Alpha (employee)
  { userEmail: 'employee.rbac@loopclub.dev', companyDocument: CNPJ_ALPHA, role: CompanyUserRole.employee },
  // Owner Beta → Empresa Beta (owner)
  { userEmail: 'owner.beta@loopclub.dev',    companyDocument: CNPJ_BETA,  role: CompanyUserRole.owner },
  // Multi Company → Alpha (owner) + Beta (owner) = 2 vínculos ativos
  { userEmail: 'multi.company@loopclub.dev', companyDocument: CNPJ_ALPHA, role: CompanyUserRole.owner },
  { userEmail: 'multi.company@loopclub.dev', companyDocument: CNPJ_MULTI, role: CompanyUserRole.owner },
  // Unlinked Owner → sem vínculo (teste de zero CompanyUser)
];

async function main() {
  const seedPassword = process.env.RBAC_SEED_PASSWORD;
  if (!seedPassword) {
    console.error('[Seed] ERRO: Variável RBAC_SEED_PASSWORD não definida.');
    console.error('[Seed] Defina RBAC_SEED_PASSWORD no .env para uso local de desenvolvimento.');
    console.error('[Seed] Aviso: nunca reutilize esta senha em produção.');
    process.exit(1);
  }

  console.log('[Seed] Iniciando seed de desenvolvimento multi-tenancy...');
  console.log('[Seed] Modo:', process.env.NODE_ENV);

  const passwordHash = await bcrypt.hash(seedPassword, 10);

  // --- Usuários ---
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

  // --- Empresas ---
  for (const company of SEED_COMPANIES) {
    const result = await prisma.company.upsert({
      where: { document: company.document },
      update: {},
      create: {
        name: company.name,
        document: company.document,
        category: company.category,
        status: company.status,
      },
      select: { id: true, name: true, document: true, status: true },
    });

    console.log(`[Seed] Empresa: ${result.name} — ${result.document} (${result.status})`);
  }

  // --- Vínculos CompanyUser ---
  // Buscar mapa de email → id (usuário) e document → id (empresa)
  const users = await prisma.user.findMany({
    where: { email: { in: SEED_USERS.map((u) => u.email) } },
    select: { id: true, email: true },
  });
  const userMap = new Map(users.map((u) => [u.email, u.id]));

  const companies = await prisma.company.findMany({
    where: { document: { in: SEED_COMPANIES.map((c) => c.document) } },
    select: { id: true, document: true },
  });
  const companyMap = new Map(companies.map((c) => [c.document, c.id]));

  for (const link of SEED_COMPANY_USERS) {
    const userId = userMap.get(link.userEmail);
    const companyId = companyMap.get(link.companyDocument);

    if (!userId) {
      console.warn(`[Seed] Aviso: usuário não encontrado: ${link.userEmail}`);
      continue;
    }
    if (!companyId) {
      console.warn(`[Seed] Aviso: empresa não encontrada: ${link.companyDocument}`);
      continue;
    }

    const result = await prisma.companyUser.upsert({
      where: { companyId_userId: { companyId, userId } },
      update: {},
      create: {
        userId,
        companyId,
        role: link.role,
        status: 'active',
      },
      select: { userId: true, companyId: true, role: true, status: true },
    });

    console.log(`[Seed] Vínculo: user=${link.userEmail} → empresa doc=${link.companyDocument} (${result.role})`);
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