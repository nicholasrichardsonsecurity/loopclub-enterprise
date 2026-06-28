import { execSync } from 'child_process';
import { validateTestEnvironment } from './test-environment';

/**
 * Prepara o banco e2e aplicando as migrations existentes.
 *
 * Fluxo de segurança:
 * 1. Exige NODE_ENV === 'test'
 * 2. Exige DATABASE_URL_TEST
 * 3. Valida banco via validateTestEnvironment() (sufixo, host, não conflito, etc.)
 * 4. validateTestEnvironment() redireciona DATABASE_URL para DATABASE_URL_TEST
 *    como efeito colateral — mas como este script roda fora do Jest,
 *    precisamos do valor de DATABASE_URL_TEST para o child_process
 * 5. Executa `prisma migrate deploy` com DATABASE_URL = DATABASE_URL_TEST
 *
 * Nunca imprime URL, usuário ou senha.
 * Nunca usa fallback para DATABASE_URL de desenvolvimento.
 */
function main(): void {
  // 1. Exige NODE_ENV === 'test' (antes de qualquer outra operação)
  if (process.env.NODE_ENV !== 'test') {
    console.error(
      '[prepare-e2e] Execução e2e recusada: NODE_ENV deve ser "test". ' +
      `Valor atual: "${process.env.NODE_ENV ?? '(não definido)'}".`,
    );
    process.exit(1);
  }

  // 2. Exige DATABASE_URL_TEST
  const testUrl = process.env.DATABASE_URL_TEST;
  if (!testUrl) {
    console.error('[prepare-e2e] Execução e2e recusada: DATABASE_URL_TEST não definida.');
    process.exit(1);
  }

  // 3-4. Reutiliza a validação centralizada (sufixo, host, não conflito, etc.)
  //      validateTestEnvironment() também redireciona DATABASE_URL como efeito colateral
  try {
    validateTestEnvironment();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'banco de testes não autorizado.';
    console.error(`[prepare-e2e] ${message}`);
    process.exit(1);
  }

  // 5. Executa migration com DATABASE_URL forçada para a URL de teste
  //    (o redirecionamento dentro do validateTestEnvironment só vale in-process;
  //     para o child_process precisamos passar explicitamente)
  console.log('[prepare-e2e] Aplicando migrations existentes no banco de testes...');

  try {
    execSync('npx prisma migrate deploy', {
      env: {
        ...process.env,
        DATABASE_URL: testUrl,
      },
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log('[prepare-e2e] Migrations aplicadas com sucesso.');
  } catch (error) {
    console.error('[prepare-e2e] ERRO ao aplicar migrations:', (error as Error).message);
    process.exit(1);
  }
}

main();