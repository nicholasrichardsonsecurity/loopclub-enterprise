import request from 'supertest';
import { INestApplication } from '@nestjs/common';

/**
 * Helper de autenticação para testes e2e.
 *
 * Realiza login no endpoint real POST /auth/login e retorna
 * o token JWT. Reduz duplicação entre os cenários.
 *
 * A senha é lida de E2E_TEST_PASSWORD (definida no ambiente).
 * Nunca imprime ou fixa a senha no código.
 */
export async function loginAs(
  app: INestApplication,
  email: string,
): Promise<string> {
  const password = process.env.E2E_TEST_PASSWORD;
  if (!password) {
    throw new Error('E2E_TEST_PASSWORD não definida para login.');
  }

  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(200);

  const token: string = response.body.accessToken;
  if (!token) {
    throw new Error(`Login de ${email} não retornou accessToken.`);
  }

  return token;
}