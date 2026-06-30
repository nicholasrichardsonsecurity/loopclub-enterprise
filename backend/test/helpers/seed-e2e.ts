import { PrismaClient, UserRole, CompanyUserRole, CompanyStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Seed exclusivo para testes e2e.
 *
 * Características:
 * - Idempotente (usa upsert)
 * - Senha lida de E2E_TEST_PASSWORD (nunca fixa no código)
 * - Contém APENAS os dados mínimos necessários para os cenários e2e
 * - Não depende de NODE_ENV (a proteção é feita pelo test-environment.ts)
 * - Não registra senhas ou URLs completas nos logs
 */

const CNPJ_ALPHA = '00000000000191';
const CNPJ_BETA = '00000000000272';
const CNPJ_MULTI = '00000000000353';

interface SeedUser {
  name: string;
  email: string;
  role: UserRole;
}

const SEED_USERS: SeedUser[] = [
  // admin — vê todas as empresas
  { name: 'Admin E2E', email: 'admin.e2e@loopclub.dev', role: UserRole.admin },
  // company_owners — cada um vê somente sua empresa
  { name: 'Owner Alpha E2E', email: 'owner.alpha.e2e@loopclub.dev', role: UserRole.company_owner },
  { name: 'Owner Beta E2E', email: 'owner.beta.e2e@loopclub.dev', role: UserRole.company_owner },
  // employee — bloqueado pelo RolesGuard em GET /companies
  { name: 'Employee E2E', email: 'employee.e2e@loopclub.dev', role: UserRole.employee },
  // client — bloqueado pelo RolesGuard em GET /companies
  { name: 'Client E2E', email: 'client.e2e@loopclub.dev', role: UserRole.client },
  // multi-vínculo — owner de duas empresas, bloqueado pelo TenantGuard
  { name: 'Multi E2E', email: 'multi.e2e@loopclub.dev', role: UserRole.company_owner },
  // sem vínculo — owner sem CompanyUser, bloqueado pelo TenantGuard
  { name: 'Unlinked E2E', email: 'unlinked.e2e@loopclub.dev', role: UserRole.company_owner },
  // vinculado a empresa inativa — bloqueado pelo TenantGuard
  { name: 'Blocked Co E2E', email: 'blocked.co.e2e@loopclub.dev', role: UserRole.company_owner },
  // vínculo inativo — CompanyUser com status blocked, empresa ativa
  { name: 'Inactive Link E2E', email: 'inactive.link.e2e@loopclub.dev', role: UserRole.company_owner },
];

interface SeedCompany {
  name: string;
  document: string;
  category: string;
  status: CompanyStatus;
}

const SEED_COMPANIES: SeedCompany[] = [
  { name: 'Empresa Alpha E2E', document: CNPJ_ALPHA, category: 'acai', status: CompanyStatus.active },
  { name: 'Empresa Beta E2E', document: CNPJ_BETA, category: 'restaurante', status: CompanyStatus.active },
  { name: 'Empresa Blocked E2E', document: CNPJ_MULTI, category: 'barbearia', status: CompanyStatus.blocked },
];

interface SeedCompanyUser {
  userEmail: string;
  companyDocument: string;
  role: CompanyUserRole;
  status?: 'active' | 'blocked' | 'deleted';
}

const SEED_COMPANY_USERS: SeedCompanyUser[] = [
  // Owner Alpha → Empresa Alpha
  { userEmail: 'owner.alpha.e2e@loopclub.dev', companyDocument: CNPJ_ALPHA, role: CompanyUserRole.owner },
  // Employee → Empresa Alpha
  { userEmail: 'employee.e2e@loopclub.dev', companyDocument: CNPJ_ALPHA, role: CompanyUserRole.employee },
  // Owner Beta → Empresa Beta
  { userEmail: 'owner.beta.e2e@loopclub.dev', companyDocument: CNPJ_BETA, role: CompanyUserRole.owner },
  // Multi → Alpha (owner) + Beta (owner) = 2 vínculos ativos
  { userEmail: 'multi.e2e@loopclub.dev', companyDocument: CNPJ_ALPHA, role: CompanyUserRole.owner },
  { userEmail: 'multi.e2e@loopclub.dev', companyDocument: CNPJ_MULTI, role: CompanyUserRole.owner },
  // Blocked Co → Empresa Blocked (empresa inativa)
  { userEmail: 'blocked.co.e2e@loopclub.dev', companyDocument: CNPJ_MULTI, role: CompanyUserRole.owner },
  // Vínculo inativo — owner com CompanyUser.blocked em empresa ativa
  { userEmail: 'inactive.link.e2e@loopclub.dev', companyDocument: CNPJ_ALPHA, role: CompanyUserRole.owner, status: 'blocked' },
];

export async function seedE2e(prisma: PrismaClient): Promise<void> {
  const seedPassword = process.env.E2E_TEST_PASSWORD;
  if (!seedPassword) {
    console.error('[seed-e2e] E2E_TEST_PASSWORD não definida.');
    throw new Error('E2E_TEST_PASSWORD não definida.');
  }

  const passwordHash = await bcrypt.hash(seedPassword, 10);

  // Usuários
  for (const user of SEED_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        role: user.role,
        passwordHash,
        status: 'active',
      },
    });
  }

  // Empresas
  for (const company of SEED_COMPANIES) {
    await prisma.company.upsert({
      where: { document: company.document },
      update: {},
      create: {
        name: company.name,
        document: company.document,
        category: company.category,
        status: company.status,
      },
    });
  }

  // Buscar mapas de email → id e document → id
  const allUsers = await prisma.user.findMany({
    where: { email: { in: SEED_USERS.map((u) => u.email) } },
    select: { id: true, email: true },
  });
  const userMap = new Map(allUsers.map((u) => [u.email, u.id]));

  const allCompanies = await prisma.company.findMany({
    where: { document: { in: SEED_COMPANIES.map((c) => c.document) } },
    select: { id: true, document: true },
  });
  const companyMap = new Map(allCompanies.map((c) => [c.document, c.id]));

  // Vínculos
  for (const link of SEED_COMPANY_USERS) {
    const userId = userMap.get(link.userEmail);
    const companyId = companyMap.get(link.companyDocument);
    if (!userId || !companyId) {
      continue;
    }
    await prisma.companyUser.upsert({
      where: { companyId_userId: { companyId, userId } },
      update: {},
      create: {
        userId,
        companyId,
        role: link.role,
        status: link.status ?? 'active',
      },
    });
  }

  // ===================================================================
  // Customers para testes de listagem, busca e detalhe
  // ===================================================================
  const alphaId = companyMap.get(CNPJ_ALPHA)!;
  const betaId = companyMap.get(CNPJ_BETA)!;

  // Customer global → Alpha
  const custAlpha1 = await prisma.customer.upsert({
    where: { phoneE164: '+5581999999001' },
    update: {},
    create: {
      name: 'Cliente Alpha 01',
      phoneE164: '+5581999999001',
      emailNormalized: 'cliente.alpha01@test.loopclub.dev',
      birthDate: new Date('1990-03-15'),
    },
  });
  await prisma.companyCustomer.upsert({
    where: { customerId_companyId: { customerId: custAlpha1.id, companyId: alphaId } },
    update: {},
    create: {
      customerId: custAlpha1.id,
      companyId: alphaId,
      internalCode: 'ALPHA-001',
      source: 'manual',
      notes: 'Cliente VIP',
    },
  });

  // Customer global → Alpha (sem birthDate, para testar employee)
  const custAlpha2 = await prisma.customer.upsert({
    where: { phoneE164: '+5581999999002' },
    update: {},
    create: {
      name: 'Cliente Alpha 02',
      phoneE164: '+5581999999002',
      emailNormalized: 'cliente.alpha02@test.loopclub.dev',
    },
  });
  await prisma.companyCustomer.upsert({
    where: { customerId_companyId: { customerId: custAlpha2.id, companyId: alphaId } },
    update: {},
    create: {
      customerId: custAlpha2.id,
      companyId: alphaId,
      internalCode: 'ALPHA-002',
      source: 'qrcode',
    },
  });

  // Customer global → Beta (isolamento)
  const custBeta1 = await prisma.customer.upsert({
    where: { phoneE164: '+5581999999003' },
    update: {},
    create: {
      name: 'Cliente Beta 01',
      phoneE164: '+5581999999003',
      emailNormalized: 'cliente.beta01@test.loopclub.dev',
      birthDate: new Date('1985-07-20'),
    },
  });
  await prisma.companyCustomer.upsert({
    where: { customerId_companyId: { customerId: custBeta1.id, companyId: betaId } },
    update: {},
    create: {
      customerId: custBeta1.id,
      companyId: betaId,
      internalCode: 'BETA-001',
      source: 'manual',
    },
  });

  console.log('[seed-e2e] Dados de teste preparados com sucesso.');
}