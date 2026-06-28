import request from 'supertest';
import { INestApplication } from '@nestjs/common';

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