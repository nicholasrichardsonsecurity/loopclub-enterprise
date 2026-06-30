import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/prisma.service';

/**
 * Realiza GET /companies autenticado e retorna a resposta.
 * Helper para reduzir duplicação nos cenários de RBAC/tenant.
 */
export function getCompanies(
  app: INestApplication,
  token: string,
): request.Test {
  return request(app.getHttpServer())
    .get('/companies')
    .set('Authorization', `Bearer ${token}`);
}

/**
 * Realiza GET /companies sem token.
 */
export function getCompaniesUnauthenticated(
  app: INestApplication,
): request.Test {
  return request(app.getHttpServer()).get('/companies');
}

// -----------------------------------------------------------------------
// Helpers para POST /customers
// -----------------------------------------------------------------------

/**
 * Realiza POST /customers autenticado e retorna a resposta.
 */
export function postCustomer(
  app: INestApplication,
  token: string,
  body: Record<string, unknown>,
): request.Test {
  return request(app.getHttpServer())
    .post('/customers')
    .set('Authorization', `Bearer ${token}`)
    .send(body);
}

/**
 * Realiza POST /customers sem token.
 */
export function postCustomerUnauthenticated(
  app: INestApplication,
  body: Record<string, unknown>,
): request.Test {
  return request(app.getHttpServer())
    .post('/customers')
    .send(body);
}

/**
 * Valida que a resposta de sucesso do POST /customers não contém
 * campos sensíveis: cpfLookupHash, cpfLastDigits, userId.
 */
export function assertNoSensitiveFields(body: Record<string, unknown>): void {
  expect(body).not.toHaveProperty('cpfLookupHash');
  expect(body).not.toHaveProperty('cpfLastDigits');
  expect(body).not.toHaveProperty('userId');
}

/**
 * Consulta um Customer global pelo phoneE164.
 */
export async function findCustomerByPhone(
  prisma: PrismaService,
  phoneE164: string,
) {
  return prisma.customer.findUnique({ where: { phoneE164 } });
}

/**
 * Consulta um CompanyCustomer por customerId + companyId.
 */
export async function findCompanyCustomer(
  prisma: PrismaService,
  customerId: string,
  companyId: string,
) {
  return prisma.companyCustomer.findUnique({
    where: { customerId_companyId: { customerId, companyId } },
  });
}

/**
 * Busca AuditLog relacionado a uma entidade.
 */
export async function findAuditLog(
  prisma: PrismaService,
  entity: string,
  entityId: string,
) {
  return prisma.auditLog.findFirst({
    where: { entity, entityId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Conta vínculos CompanyCustomer de uma empresa.
 */
export async function countCompanyCustomers(
  prisma: PrismaService,
  companyId: string,
): Promise<number> {
  return prisma.companyCustomer.count({ where: { companyId } });
}

// -----------------------------------------------------------------------
// Helpers para GET /customers (listagem, busca, detalhe)
// -----------------------------------------------------------------------

/**
 * Realiza GET /customers autenticado.
 */
export function listCustomers(
  app: INestApplication,
  token: string,
  query?: Record<string, string | number | undefined>,
): request.Test {
  let req = request(app.getHttpServer())
    .get('/customers')
    .set('Authorization', `Bearer ${token}`);
  if (query) {
    req = req.query(query);
  }
  return req;
}

/**
 * Realiza GET /customers/search autenticado.
 */
export function searchCustomers(
  app: INestApplication,
  token: string,
  query: Record<string, string | number>,
): request.Test {
  return request(app.getHttpServer())
    .get('/customers/search')
    .set('Authorization', `Bearer ${token}`)
    .query(query);
}

/**
 * Realiza GET /customers/search sem token.
 */
export function searchCustomersUnauthenticated(
  app: INestApplication,
  query: Record<string, string | number>,
): request.Test {
  return request(app.getHttpServer())
    .get('/customers/search')
    .query(query);
}

/**
 * Realiza GET /customers/:id autenticado.
 */
export function getCustomerDetail(
  app: INestApplication,
  token: string,
  companyCustomerId: string,
): request.Test {
  return request(app.getHttpServer())
    .get(`/customers/${companyCustomerId}`)
    .set('Authorization', `Bearer ${token}`);
}

/**
 * Realiza GET /customers/:id sem token.
 */
export function getCustomerDetailUnauthenticated(
  app: INestApplication,
  companyCustomerId: string,
): request.Test {
  return request(app.getHttpServer())
    .get(`/customers/${companyCustomerId}`);
}