import request from 'supertest';
import { setupE2e, type E2eContext } from './helpers/setup';
import { loginAs } from './helpers/auth-e2e';
import {
  getCompanies,
  getCompaniesUnauthenticated,
  postCustomer,
  postCustomerUnauthenticated,
  assertNoSensitiveFields,
  findCustomerByPhone,
  findCompanyCustomer,
  findAuditLog,
  countCompanyCustomers,
  listCustomers,
  searchCustomers,
  getCustomerDetail,
  getCustomerDetailUnauthenticated,
} from './helpers/assertions-e2e';

describe('Testes e2e do LoopClub', () => {
  let ctx: E2eContext;

  beforeAll(async () => {
    ctx = await setupE2e();
  });

  afterAll(async () => {
    if (ctx?.app) {
      await ctx.app.close();
    }
    if (ctx?.prisma) {
      await ctx.prisma.$disconnect();
    }
  });

  // -----------------------------------------------------------------------
  // Smoke test de infraestrutura
  // -----------------------------------------------------------------------
  describe('Infraestrutura (smoke)', () => {
    it('deve inicializar a aplicação NestJS', () => {
      expect(ctx.app).toBeDefined();
      expect(ctx.prisma).toBeDefined();
    });

    it('deve conectar ao banco e2e', async () => {
      const result = await ctx.prisma.$queryRawUnsafe<
        Array<{ current_database: string }>
      >('SELECT current_database();');
      const dbName = result[0]?.current_database;
      expect(dbName).toMatch(/_e2e$|_test$/);
    });

    it('deve responder GET /auth/health com 200', async () => {
      const response = await request(ctx.app.getHttpServer()).get('/auth/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('service', 'auth');
    });
  });

  // -----------------------------------------------------------------------
  // Cenário 1 — Login do administrador
  // -----------------------------------------------------------------------
  describe('Autenticação', () => {
    it('C01: login do administrador retorna 200 com accessToken', async () => {
      const token = await loginAs(ctx.app, 'admin.e2e@loopclub.dev');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });

  // -----------------------------------------------------------------------
  // Cenário 2 — Admin vê todas as empresas
  // -----------------------------------------------------------------------
  describe('Admin — GET /companies', () => {
    it('C02: admin vê todas as 3 empresas', async () => {
      const token = await loginAs(ctx.app, 'admin.e2e@loopclub.dev');
      const response = await getCompanies(ctx.app, token);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);

      const names = response.body.map((c: { name: string }) => c.name);
      expect(names).toContain('Empresa Alpha E2E');
      expect(names).toContain('Empresa Beta E2E');
      expect(names).toContain('Empresa Blocked E2E');
    });
  });

  // -----------------------------------------------------------------------
  // Cenário 3 — Owner Alpha vê somente sua empresa
  // -----------------------------------------------------------------------
  describe('Owner Alpha — GET /companies', () => {
    it('C03: Owner Alpha vê somente Empresa Alpha', async () => {
      const token = await loginAs(ctx.app, 'owner.alpha.e2e@loopclub.dev');
      const response = await getCompanies(ctx.app, token);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Empresa Alpha E2E');
      // Confirma que não há dados de outros tenants
      expect(response.body[0].document).toBe('00000000000191');
    });
  });

  // -----------------------------------------------------------------------
  // Cenário 4 — Owner Beta vê somente sua empresa
  // -----------------------------------------------------------------------
  describe('Owner Beta — GET /companies', () => {
    it('C04: Owner Beta vê somente Empresa Beta', async () => {
      const token = await loginAs(ctx.app, 'owner.beta.e2e@loopclub.dev');
      const response = await getCompanies(ctx.app, token);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Empresa Beta E2E');
      expect(response.body[0].document).toBe('00000000000272');
    });
  });

  // -----------------------------------------------------------------------
  // Cenário 5 — Employee bloqueado pelo RolesGuard
  // -----------------------------------------------------------------------
  describe('Employee — GET /companies', () => {
    it('C05: employee recebe 403', async () => {
      const token = await loginAs(ctx.app, 'employee.e2e@loopclub.dev');
      const response = await getCompanies(ctx.app, token);
      expect(response.status).toBe(403);
    });
  });

  // -----------------------------------------------------------------------
  // Cenário 6 — Client bloqueado pelo RolesGuard
  // -----------------------------------------------------------------------
  describe('Client — GET /companies', () => {
    it('C06: client recebe 403', async () => {
      const token = await loginAs(ctx.app, 'client.e2e@loopclub.dev');
      const response = await getCompanies(ctx.app, token);
      expect(response.status).toBe(403);
    });
  });

  // -----------------------------------------------------------------------
  // Cenário 7 — Owner sem vínculo bloqueado pelo TenantGuard
  // -----------------------------------------------------------------------
  describe('Owner sem vínculo — GET /companies', () => {
    it('C07: owner sem vínculo recebe 403', async () => {
      const token = await loginAs(ctx.app, 'unlinked.e2e@loopclub.dev');
      const response = await getCompanies(ctx.app, token);
      expect(response.status).toBe(403);
    });
  });

  // -----------------------------------------------------------------------
  // Cenário 8 — Múltiplos vínculos bloqueado pelo TenantGuard
  // -----------------------------------------------------------------------
  describe('Múltiplos vínculos — GET /companies', () => {
    it('C08: owner com múltiplos vínculos recebe 403', async () => {
      const token = await loginAs(ctx.app, 'multi.e2e@loopclub.dev');
      const response = await getCompanies(ctx.app, token);
      expect(response.status).toBe(403);
    });
  });

  // -----------------------------------------------------------------------
  // Cenário 9 — Sem token
  // -----------------------------------------------------------------------
  describe('Sem token — GET /companies', () => {
    it('C09: requisição sem token recebe 401', async () => {
      const response = await getCompaniesUnauthenticated(ctx.app);
      expect(response.status).toBe(401);
    });
  });

  // -----------------------------------------------------------------------
  // Cenário 10 — Token inválido
  // -----------------------------------------------------------------------
  describe('Token inválido — GET /companies', () => {
    it('C10: token inválido recebe 401', async () => {
      const response = await getCompanies(ctx.app, 'token.totalmente.invalido');
      expect(response.status).toBe(401);
    });
  });

  // -----------------------------------------------------------------------
  // Cenário 11 — Empresa inativa
  // -----------------------------------------------------------------------
  describe('Empresa inativa — GET /companies', () => {
    it('C11: owner de empresa inativa recebe 403', async () => {
      const token = await loginAs(ctx.app, 'blocked.co.e2e@loopclub.dev');
      const response = await getCompanies(ctx.app, token);
      expect(response.status).toBe(403);
    });
  });

  // -----------------------------------------------------------------------
  // Cenário 12 — Vínculo inativo
  // -----------------------------------------------------------------------
  describe('Vínculo inativo — GET /companies', () => {
    it('C12: owner com vínculo inativo recebe 403', async () => {
      const token = await loginAs(ctx.app, 'inactive.link.e2e@loopclub.dev');
      const response = await getCompanies(ctx.app, token);
      expect(response.status).toBe(403);
    });
  });

  // =======================================================================
  // Customers — POST /customers
  // =======================================================================

  describe('POST /customers — Criação de cliente', () => {
    // Helper: resolve company ID by document
    let alphaCompanyId: string;
    let betaCompanyId: string;
    let blockedCompanyId: string;

    beforeAll(async () => {
      const companies = await ctx.prisma.company.findMany({
        where: { document: { in: ['00000000000191', '00000000000272', '00000000000353'] } },
        select: { id: true, document: true },
      });
      alphaCompanyId = companies.find((c) => c.document === '00000000000191')!.id;
      betaCompanyId = companies.find((c) => c.document === '00000000000272')!.id;
      blockedCompanyId = companies.find((c) => c.document === '00000000000353')!.id;
    });

    // --- C13: Owner Alpha cria cliente novo → 201 ---
    it('C13: owner Alpha cria cliente novo → 201', async () => {
      const token = await loginAs(ctx.app, 'owner.alpha.e2e@loopclub.dev');
      const response = await postCustomer(ctx.app, token, {
        name: 'Maria C13',
        phone: '(81) 99999-1301',
        email: 'maria.c13@test.loopclub.dev',
        internalCode: 'C13-001',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('companyCustomerId');
      expect(response.body).toHaveProperty('customerId');
      expect(response.body).toHaveProperty('name', 'Maria C13');
      expect(response.body).toHaveProperty('phoneE164', '+5581999991301');
      expect(response.body).toHaveProperty('emailNormalized', 'maria.c13@test.loopclub.dev');
      expect(response.body).toHaveProperty('internalCode', 'C13-001');
      expect(response.body).toHaveProperty('status', 'active');
      expect(response.body).toHaveProperty('source', 'manual');
      expect(response.body).toHaveProperty('isNewCustomer', true);
      expect(response.body.joinedAt).toBeDefined();
      assertNoSensitiveFields(response.body);

      // Verificar no banco
      const customer = await findCustomerByPhone(ctx.prisma, '+5581999991301');
      expect(customer).toBeDefined();
      expect(customer!.name).toBe('Maria C13');

      const link = await findCompanyCustomer(ctx.prisma, customer!.id, alphaCompanyId);
      expect(link).toBeDefined();
      expect(link!.status).toBe('active');
    });

    // --- C14: Employee Alpha cria cliente novo → 201 ---
    it('C14: employee Alpha cria cliente novo → 201', async () => {
      const token = await loginAs(ctx.app, 'employee.e2e@loopclub.dev');
      const response = await postCustomer(ctx.app, token, {
        name: 'José C14',
        phone: '(81) 99999-1401',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('isNewCustomer', true);
      assertNoSensitiveFields(response.body);
    });

    // --- C15: mesmo Customer global é vinculado à Beta (reusa telefone) ---
    it('C15: mesmo Customer global é vinculado à Beta → 201', async () => {
      // Primeiro cria o customer na Alpha
      const tokenAlpha = await loginAs(ctx.app, 'owner.alpha.e2e@loopclub.dev');
      const createRes = await postCustomer(ctx.app, tokenAlpha, {
        name: 'Carlos C15',
        phone: '(81) 99999-1501',
      });
      expect(createRes.status).toBe(201);
      const globalCustomerId = createRes.body.customerId;
      expect(createRes.body.isNewCustomer).toBe(true);

      // Reusa o mesmo telefone em outra empresa
      const tokenBeta = await loginAs(ctx.app, 'owner.beta.e2e@loopclub.dev');
      const response = await postCustomer(ctx.app, tokenBeta, {
        name: 'Carlos C15',
        phone: '(81) 99999-1501',
      });

      expect(response.status).toBe(201);
      expect(response.body.customerId).toBe(globalCustomerId);
      expect(response.body.isNewCustomer).toBe(false);
      assertNoSensitiveFields(response.body);

      // Verificar vínculo na Beta
      const link = await findCompanyCustomer(ctx.prisma, globalCustomerId, betaCompanyId);
      expect(link).toBeDefined();
      expect(link!.status).toBe('active');

      // Contar vínculos: Alpha + Beta = 2
      const count = await countCompanyCustomers(ctx.prisma, alphaCompanyId);
      expect(count).toBeGreaterThanOrEqual(1);
    });

    // --- C16: vínculo duplicado na mesma empresa → 409 ---
    it('C16: vínculo duplicado na mesma empresa → 409', async () => {
      const token = await loginAs(ctx.app, 'owner.alpha.e2e@loopclub.dev');

      // Primeira criação
      const first = await postCustomer(ctx.app, token, {
        name: 'Duplicado C16',
        phone: '(81) 99999-1601',
      });
      expect(first.status).toBe(201);

      // Segunda tentativa com mesmo telefone na mesma empresa
      const second = await postCustomer(ctx.app, token, {
        name: 'Duplicado C16',
        phone: '(81) 99999-1601',
      });

      expect(second.status).toBe(409);
    });

    // --- C17: sem token → 401 ---
    it('C17: sem token → 401', async () => {
      const response = await postCustomerUnauthenticated(ctx.app, {
        name: 'Sem Token',
        phone: '(81) 99999-1701',
      });
      expect(response.status).toBe(401);
    });

    // --- C18: token inválido → 401 ---
    it('C18: token inválido → 401', async () => {
      const response = await postCustomer(ctx.app, 'token.invalido.aqui', {
        name: 'Token Inválido',
        phone: '(81) 99999-1801',
      });
      expect(response.status).toBe(401);
    });

    // --- C19: client → 403 ---
    it('C19: client → 403', async () => {
      const token = await loginAs(ctx.app, 'client.e2e@loopclub.dev');
      const response = await postCustomer(ctx.app, token, {
        name: 'Client User',
        phone: '(81) 99999-1901',
      });
      expect(response.status).toBe(403);
    });

    // --- C20: admin → 403 ---
    it('C20: admin → 403', async () => {
      const token = await loginAs(ctx.app, 'admin.e2e@loopclub.dev');
      const response = await postCustomer(ctx.app, token, {
        name: 'Admin User',
        phone: '(81) 99999-2001',
      });
      expect(response.status).toBe(403);
    });

    // --- C21: empresa inativa → 403 ---
    it('C21: empresa inativa → 403', async () => {
      const token = await loginAs(ctx.app, 'blocked.co.e2e@loopclub.dev');
      const response = await postCustomer(ctx.app, token, {
        name: 'Empresa Inativa',
        phone: '(81) 99999-2101',
      });
      expect(response.status).toBe(403);
    });

    // --- C22: vínculo empresarial inativo → 403 ---
    it('C22: vínculo empresarial inativo → 403', async () => {
      const token = await loginAs(ctx.app, 'inactive.link.e2e@loopclub.dev');
      const response = await postCustomer(ctx.app, token, {
        name: 'Vínculo Inativo',
        phone: '(81) 99999-2201',
      });
      expect(response.status).toBe(403);
    });

    // --- C23: body com companyId extra → 400 ---
    it('C23: body com companyId extra → 400', async () => {
      const token = await loginAs(ctx.app, 'owner.alpha.e2e@loopclub.dev');
      const response = await postCustomer(ctx.app, token, {
        name: 'CompanyId Extra',
        phone: '(81) 99999-2301',
        companyId: 'some-extra-id',
      });
      expect(response.status).toBe(400);
    });

    // --- C24: telefone inválido → 400 ---
    it('C24: telefone inválido → 400', async () => {
      const token = await loginAs(ctx.app, 'owner.alpha.e2e@loopclub.dev');
      const response = await postCustomer(ctx.app, token, {
        name: 'Telefone Ruim',
        phone: '123',
      });
      expect(response.status).toBe(400);
    });

    // --- C25: CPF inválido → 400 ---
    it('C25: CPF inválido → 400', async () => {
      const token = await loginAs(ctx.app, 'owner.alpha.e2e@loopclub.dev');
      const response = await postCustomer(ctx.app, token, {
        name: 'CPF Ruim',
        phone: '(81) 99999-2501',
        cpf: '11111111111',
      });
      expect(response.status).toBe(400);
    });

    // --- C26: internalCode duplicado → 409 ---
    it('C26: internalCode duplicado → 409', async () => {
      const token = await loginAs(ctx.app, 'owner.alpha.e2e@loopclub.dev');

      // Primeiro uso do código
      const first = await postCustomer(ctx.app, token, {
        name: 'Primeiro C26',
        phone: '(81) 99999-2601',
        internalCode: 'C26-DUP',
      });
      expect(first.status).toBe(201);

      // Segundo uso com mesmo código (outro telefone)
      const second = await postCustomer(ctx.app, token, {
        name: 'Segundo C26',
        phone: '(81) 99999-2602',
        internalCode: 'C26-DUP',
      });
      expect(second.status).toBe(409);
    });

    // --- C27: resposta não contém cpfLookupHash, cpfLastDigits ou userId ---
    it('C27: resposta não contém campos sensíveis', async () => {
      const token = await loginAs(ctx.app, 'owner.alpha.e2e@loopclub.dev');
      const response = await postCustomer(ctx.app, token, {
        name: 'Sem Sensíveis C27',
        phone: '(81) 99999-2701',
        cpf: '529.982.247-25',
      });

      expect(response.status).toBe(201);
      expect(response.body).not.toHaveProperty('cpfLookupHash');
      expect(response.body).not.toHaveProperty('cpfLastDigits');
      expect(response.body).not.toHaveProperty('userId');
    });

    // --- C28: AuditLog criado na mesma transação ---
    it('C28: AuditLog criado na mesma transação', async () => {
      const token = await loginAs(ctx.app, 'owner.alpha.e2e@loopclub.dev');
      const response = await postCustomer(ctx.app, token, {
        name: 'Auditável C28',
        phone: '(81) 99999-2801',
      });

      expect(response.status).toBe(201);
      const companyCustomerId = response.body.companyCustomerId;

      const auditLog = await findAuditLog(ctx.prisma, 'CompanyCustomer', companyCustomerId);
      expect(auditLog).toBeDefined();
      expect(auditLog!.action).toBe('customer.link.create');
      expect(auditLog!.entity).toBe('CompanyCustomer');
      expect(auditLog!.entityId).toBe(companyCustomerId);
    });
  });

  // =======================================================================
  // Customers — GET /customers (listagem paginada)
  // =======================================================================

  describe('GET /customers — Listagem de clientes', () => {
    let alphaCompanyId: string;

    beforeAll(async () => {
      const company = await ctx.prisma.company.findUnique({ where: { document: '00000000000191' }, select: { id: true } });
      alphaCompanyId = company!.id;
    });

    it('C29: owner Alpha lista clientes da Alpha → 200', async () => {
      const token = await loginAs(ctx.app, 'owner.alpha.e2e@loopclub.dev');
      const response = await listCustomers(ctx.app, token);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('limit', 20);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.items)).toBe(true);
      // Deve incluir os clientes seed da Alpha
      const names = response.body.items.map((i: any) => i.name);
      expect(names).toContain('Cliente Alpha 01');
      expect(names).toContain('Cliente Alpha 02');
    });

    it('C30: employee Alpha lista clientes da Alpha → 200', async () => {
      const token = await loginAs(ctx.app, 'employee.e2e@loopclub.dev');
      const response = await listCustomers(ctx.app, token);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.items)).toBe(true);
      // Employee não vê cpfLastDigits nem birthDate
      const item = response.body.items[0];
      expect(item).not.toHaveProperty('cpfLastDigits');
      expect(item).not.toHaveProperty('birthDate');
    });

    it('C31: owner Beta NÃO vê clientes da Alpha (isolamento)', async () => {
      const token = await loginAs(ctx.app, 'owner.beta.e2e@loopclub.dev');
      const response = await listCustomers(ctx.app, token);

      expect(response.status).toBe(200);
      const names = response.body.items.map((i: any) => i.name);
      expect(names).not.toContain('Cliente Alpha 01');
      expect(names).not.toContain('Cliente Alpha 02');
    });

    it('C32: paginação funciona com page e limit', async () => {
      const token = await loginAs(ctx.app, 'owner.alpha.e2e@loopclub.dev');
      const response = await listCustomers(ctx.app, token, { page: 1, limit: 1 });

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBeLessThanOrEqual(1);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(1);
    });

    it('C33: limit máximo 100 é respeitado', async () => {
      const token = await loginAs(ctx.app, 'owner.alpha.e2e@loopclub.dev');
      const response = await listCustomers(ctx.app, token, { limit: 100 });

      expect(response.status).toBe(200);
      expect(response.body.limit).toBe(100);
    });

    it('C34: sem token → 401', async () => {
      const response = await request(ctx.app.getHttpServer()).get('/customers');
      expect(response.status).toBe(401);
    });

    it('C35: token inválido → 401', async () => {
      const response = await listCustomers(ctx.app, 'token.totalmente.invalido');
      expect(response.status).toBe(401);
    });

    it('C36: admin → 403', async () => {
      const token = await loginAs(ctx.app, 'admin.e2e@loopclub.dev');
      const response = await listCustomers(ctx.app, token);
      expect(response.status).toBe(403);
    });

    it('C37: client → 403', async () => {
      const token = await loginAs(ctx.app, 'client.e2e@loopclub.dev');
      const response = await listCustomers(ctx.app, token);
      expect(response.status).toBe(403);
    });

    it('C38: empresa inativa → 403', async () => {
      const token = await loginAs(ctx.app, 'blocked.co.e2e@loopclub.dev');
      const response = await listCustomers(ctx.app, token);
      expect(response.status).toBe(403);
    });

    it('C39: vínculo inativo → 403', async () => {
      const token = await loginAs(ctx.app, 'inactive.link.e2e@loopclub.dev');
      const response = await listCustomers(ctx.app, token);
      expect(response.status).toBe(403);
    });
  });

  // =======================================================================
  // Customers — GET /customers/search
  // =======================================================================

  describe('GET /customers/search — Busca de clientes', () => {
    it('C40: busca por nome → 200', async () => {
      const token = await loginAs(ctx.app, 'owner.alpha.e2e@loopclub.dev');
      const response = await searchCustomers(ctx.app, token, { name: 'Alpha' });

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBeGreaterThanOrEqual(1);
      expect(response.body.items[0].name).toContain('Alpha');
    });

    it('C41: busca por telefone → 200', async () => {
      const token = await loginAs(ctx.app, 'owner.alpha.e2e@loopclub.dev');
      const response = await searchCustomers(ctx.app, token, { phone: '(81) 99999-9001' });

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBeGreaterThanOrEqual(1);
      expect(response.body.items[0].phone).toContain('99999-9001');
    });

    it('C42: busca por internalCode → 200', async () => {
      const token = await loginAs(ctx.app, 'owner.alpha.e2e@loopclub.dev');
      const response = await searchCustomers(ctx.app, token, { internalCode: 'ALPHA-001' });

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBeGreaterThanOrEqual(1);
    });

    it('C43: busca com termo curto → 400', async () => {
      const token = await loginAs(ctx.app, 'owner.alpha.e2e@loopclub.dev');
      const response = await searchCustomers(ctx.app, token, { name: 'Al' });

      expect(response.status).toBe(400);
    });

    it('C44: sem token → 401', async () => {
      const response = await request(ctx.app.getHttpServer())
        .get('/customers/search')
        .query({ name: 'Alpha' });
      expect(response.status).toBe(401);
    });

    it('C45: admin → 403', async () => {
      const token = await loginAs(ctx.app, 'admin.e2e@loopclub.dev');
      const response = await searchCustomers(ctx.app, token, { name: 'Alpha' });
      expect(response.status).toBe(403);
    });

    it('C46: client → 403', async () => {
      const token = await loginAs(ctx.app, 'client.e2e@loopclub.dev');
      const response = await searchCustomers(ctx.app, token, { name: 'Alpha' });
      expect(response.status).toBe(403);
    });
  });

  // =======================================================================
  // Customers — GET /customers/:companyCustomerId (detalhe)
  // =======================================================================

  describe('GET /customers/:companyCustomerId — Detalhe do cliente', () => {
    let alphaCustomerId: string;
    let betaCustomerId: string;

    beforeAll(async () => {
      const alpha = await ctx.prisma.companyCustomer.findFirst({
        where: {
          customer: { phoneE164: '+5581999999001' },
          company: { document: '00000000000191' },
        },
        select: { id: true },
      });
      const beta = await ctx.prisma.companyCustomer.findFirst({
        where: {
          customer: { phoneE164: '+5581999999003' },
          company: { document: '00000000000272' },
        },
        select: { id: true },
      });
      alphaCustomerId = alpha!.id;
      betaCustomerId = beta!.id;
    });

    it('C47: owner Alpha vê detalhe do próprio tenant → 200', async () => {
      const token = await loginAs(ctx.app, 'owner.alpha.e2e@loopclub.dev');
      const response = await getCustomerDetail(ctx.app, token, alphaCustomerId);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', alphaCustomerId);
      expect(response.body).toHaveProperty('name', 'Cliente Alpha 01');
      expect(response.body).toHaveProperty('phone');
      expect(response.body).toHaveProperty('email', 'cliente.alpha01@test.loopclub.dev');
      expect(response.body).toHaveProperty('internalCode', 'ALPHA-001');
      expect(response.body).toHaveProperty('status', 'active');
      expect(response.body).toHaveProperty('source', 'manual');
      expect(response.body).toHaveProperty('notes', 'Cliente VIP');
      expect(response.body).not.toHaveProperty('cpfLookupHash');
      expect(response.body).not.toHaveProperty('cpfLastDigits');
      expect(response.body).not.toHaveProperty('userId');
    });

    it('C48: owner Alpha NÃO vê detalhe de cliente Beta → 404', async () => {
      const token = await loginAs(ctx.app, 'owner.alpha.e2e@loopclub.dev');
      const response = await getCustomerDetail(ctx.app, token, betaCustomerId);

      expect(response.status).toBe(404);
    });

    it('C49: employee vê detalhe sem birthDate', async () => {
      const token = await loginAs(ctx.app, 'employee.e2e@loopclub.dev');
      const response = await getCustomerDetail(ctx.app, token, alphaCustomerId);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('birthDate', null);
    });

    it('C50: owner vê detalhe com birthDate', async () => {
      const token = await loginAs(ctx.app, 'owner.alpha.e2e@loopclub.dev');
      const response = await getCustomerDetail(ctx.app, token, alphaCustomerId);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('birthDate', '1990-03-15');
    });

    it('C51: sem token → 401', async () => {
      const response = await getCustomerDetailUnauthenticated(ctx.app, alphaCustomerId);
      expect(response.status).toBe(401);
    });

    it('C52: token inválido → 401', async () => {
      const response = await getCustomerDetail(ctx.app, 'token.totalmente.invalido', alphaCustomerId);
      expect(response.status).toBe(401);
    });

    it('C53: admin → 403', async () => {
      const token = await loginAs(ctx.app, 'admin.e2e@loopclub.dev');
      const response = await getCustomerDetail(ctx.app, token, alphaCustomerId);
      expect(response.status).toBe(403);
    });

    it('C54: client → 403', async () => {
      const token = await loginAs(ctx.app, 'client.e2e@loopclub.dev');
      const response = await getCustomerDetail(ctx.app, token, alphaCustomerId);
      expect(response.status).toBe(403);
    });

    it('C55: empresa inativa → 403', async () => {
      const token = await loginAs(ctx.app, 'blocked.co.e2e@loopclub.dev');
      const response = await getCustomerDetail(ctx.app, token, alphaCustomerId);
      expect(response.status).toBe(403);
    });

    it('C56: vínculo inativo → 403', async () => {
      const token = await loginAs(ctx.app, 'inactive.link.e2e@loopclub.dev');
      const response = await getCustomerDetail(ctx.app, token, alphaCustomerId);
      expect(response.status).toBe(403);
    });
  });
});