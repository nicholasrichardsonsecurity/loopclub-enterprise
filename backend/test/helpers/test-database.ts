import { PrismaClient } from '@prisma/client';

/**
 * Lista completa de tabelas do schema, ordenadas de forma que
 * tabelas-filho (com chaves estrangeiras) sejam deletadas antes
 * de suas tabelas-pai.
 *
 * Ordem: dependentes primeiro → independentes por último.
 * Os nomes devem usar PascalCase (como o Prisma cria no PostgreSQL)
 * e estar entre aspas duplas para proteger palavras reservadas
 * como "User".
 */
const TABLES_IN_DELETE_ORDER: string[] = [
  '"AuditLog"',
  '"CustomerConsentEvent"',
  '"CompanyCustomer"',
  '"Customer"',
  '"QrToken"',
  '"Transaction"',
  '"LoyaltyProgress"',
  '"LoyaltyMilestone"',
  '"LoyaltyProgram"',
  '"CompanyUser"',
  '"Subscription"',
  '"Plan"',
  '"Company"',
  '"User"',
];

/**
 * Limpa todas as tabelas do banco de testes respeitando a ordem
 * das chaves estrangeiras. Executa raw SQL com TRUNCATE ... CASCADE
 * para garantir que não haja violação de FK.
 *
 * Esta função NÃO DEVE ser importada por código de produção.
 * Esta função NUNCA deve executar sem que as validações de ambiente
 * tenham sido aprovadas primeiro.
 */
export async function resetTestDatabase(prisma: PrismaClient): Promise<void> {
  // Usa TRUNCATE com CASCADE em vez de deleteMany para performance
  // e respeito automático a chaves estrangeiras.
  // A ordem ainda importa porque tabelas independentes (sem FK)
  // aparecem por último, mas CASCADE já garante segurança adicional.
  const tableList = TABLES_IN_DELETE_ORDER.join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE;`);
}