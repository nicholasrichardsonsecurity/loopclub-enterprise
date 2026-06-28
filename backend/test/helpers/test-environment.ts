/**
 * Validação do ambiente de teste antes de qualquer operação no banco.
 *
 * Proteções cumulativas:
 * 1. NODE_ENV === 'test'
 * 2. DATABASE_URL_TEST definida
 * 3. Database name termina em _e2e ou _test
 * 4. Database name NÃO é 'loopclub'
 * 5. DATABASE_URL_TEST não aponta para o mesmo banco de DATABASE_URL (desenvolvimento)
 * 6. Host está em allowlist (localhost/127.0.0.1 para local, postgres para CI)
 *
 * Em caso de falha, exibe apenas mensagem segura — nunca a URL completa ou credenciais.
 */

const ALLOWED_HOSTS_LOCAL = ['localhost', '127.0.0.1'];
const ALLOWED_HOSTS_CI = ['postgres'];
const FORBIDDEN_DATABASE_NAMES = ['loopclub'];
const ALLOWED_DATABASE_SUFFIXES = ['_e2e', '_test'];

function extractDatabaseName(url: string): string | null {
  try {
    const u = new URL(url);
    const path = u.pathname; // e.g. /loopclub_e2e?schema=public
    const match = path.match(/^\/([^?]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function extractHost(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function validateTestEnvironment(): void {
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv !== 'test') {
    throw new Error(
      'Execução e2e recusada: NODE_ENV deve ser "test". ' +
      `Valor atual: "${nodeEnv ?? '(não definido)'}".`
    );
  }

  const testUrl = process.env.DATABASE_URL_TEST;
  if (!testUrl) {
    throw new Error(
      'Execução e2e recusada: DATABASE_URL_TEST não definida. ' +
      'Defina esta variável com a URL do banco de testes antes de executar os testes e2e.'
    );
  }

  const dbName = extractDatabaseName(testUrl);
  if (!dbName) {
    throw new Error('Execução e2e recusada: banco de testes não autorizado.');
  }

  // 4. Nome do banco não pode ser 'loopclub'
  if (FORBIDDEN_DATABASE_NAMES.includes(dbName.toLowerCase())) {
    throw new Error('Execução e2e recusada: banco de testes não autorizado.');
  }

  // 5. Nome do banco deve terminar com _e2e ou _test
  const hasValidSuffix = ALLOWED_DATABASE_SUFFIXES.some((suffix) =>
    dbName.toLowerCase().endsWith(suffix),
  );
  if (!hasValidSuffix) {
    throw new Error('Execução e2e recusada: banco de testes não autorizado.');
  }

  // 6. Host deve estar em allowlist
  const host = extractHost(testUrl);
  if (!host) {
    throw new Error('Execução e2e recusada: banco de testes não autorizado.');
  }

  const allAllowedHosts = [...ALLOWED_HOSTS_LOCAL, ...ALLOWED_HOSTS_CI];
  if (!allAllowedHosts.includes(host)) {
    throw new Error('Execução e2e recusada: banco de testes não autorizado.');
  }

  // 7. DATABASE_URL_TEST não pode apontar para o mesmo banco de DATABASE_URL
  const devUrl = process.env.DATABASE_URL;
  if (devUrl) {
    const devDbName = extractDatabaseName(devUrl);
    if (devDbName && devDbName.toLowerCase() === dbName.toLowerCase()) {
      throw new Error('Execução e2e recusada: banco de testes não autorizado.');
    }
  }

  // Após validação, redireciona DATABASE_URL para a URL de testes
  process.env.DATABASE_URL = testUrl;
}