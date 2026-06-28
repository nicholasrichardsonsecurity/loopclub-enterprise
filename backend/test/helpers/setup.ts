import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { validateTestEnvironment } from './test-environment';
import { resetTestDatabase } from './test-database';
import { seedE2e } from './seed-e2e';

/**
 * Configuração centralizada para os testes e2e.
 *
 * Ordem de execução:
 * 1. Validar ambiente (NODE_ENV, DATABASE_URL_TEST, proteções)
 * 2. Redirecionar DATABASE_URL ← DATABASE_URL_TEST
 * 3. Instanciar PrismaClient para operações de setup
 * 4. Limpar banco de teste
 * 5. Preparar fixtures (seed e2e)
 * 6. Inicializar NestJS com AppModule real
 * 7. Retornar app + prisma
 */

export interface E2eContext {
  app: INestApplication;
  prisma: PrismaService;
  moduleFixture: TestingModule;
}

export async function setupE2e(): Promise<E2eContext> {
  // 1. Validar ambiente — falha de forma fechada se inseguro
  validateTestEnvironment();

  // 2. Criar PrismaService para operações de setup
  //    Nota: DATABASE_URL já foi redirecionada por validateTestEnvironment()
  const prisma = new PrismaService();

  try {
    // 3. Conectar ao banco de testes
    await prisma.$connect();

    // 4. Limpar banco de teste
    await resetTestDatabase(prisma);

    // 5. Preparar fixtures e2e
    await seedE2e(prisma);

    // 6. Desconectar Prisma de setup (o módulo NestJS criará sua própria instância)
    await prisma.$disconnect();
  } catch (error) {
    await prisma.$disconnect().catch(() => {});
    throw error;
  }

  // 7. Inicializar NestJS com AppModule real
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Aplicar mesma configuração do main.ts para que os testes
  // reflitam o comportamento real da aplicação
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  await app.listen(0); // Porta dinâmica (0 = sistema escolhe)

  // Obter PrismaService da instância do NestJS
  const nestPrisma = app.get(PrismaService);

  return { app, prisma: nestPrisma, moduleFixture };
}