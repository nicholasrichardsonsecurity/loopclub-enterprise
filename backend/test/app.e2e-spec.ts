import request from 'supertest';
import { setupE2e, type E2eContext } from './helpers/setup';
import { loginAs } from './helpers/auth-e2e';
import { getCompanies, getCompaniesUnauthenticated } from './helpers/assertions-e2e';

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
});