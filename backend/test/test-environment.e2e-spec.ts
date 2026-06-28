/**
 * Testes negativos de segurança para validateTestEnvironment().
 *
 * Cada cenário comprova que a validação recusa o ambiente antes de
 * qualquer operação no banco (migration, conexão, limpeza ou seed).
 *
 * Nenhum destes testes depende de banco de dados real.
 * Nenhum destes testes modifica qualquer banco.
 */

import { validateTestEnvironment } from './helpers/test-environment';

// Guarda o ambiente original para restaurar após os testes
const ORIGINAL_ENV = { ...process.env };

describe('Segurança — validateTestEnvironment()', () => {
  // URL de teste válida para usar como base nos cenários de erro
  const VALID_TEST_URL =
    'postgresql://user:pass@localhost:5432/loopclub_e2e_test?schema=public';

  beforeEach(() => {
    // Limpa variáveis que podem ter vazado de outros testes
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_URL_TEST;
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    // Restaura o ambiente original
    process.env = { ...ORIGINAL_ENV };
  });

  // A - NODE_ENV diferente de 'test'
  it('deve recusar NODE_ENV diferente de "test"', () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL_TEST = VALID_TEST_URL;

    expect(() => validateTestEnvironment()).toThrow(
      'Execução e2e recusada: NODE_ENV deve ser "test"',
    );
  });

  // B - DATABASE_URL_TEST ausente (não definida)
  it('deve recusar DATABASE_URL_TEST ausente', () => {
    delete process.env.DATABASE_URL_TEST;

    expect(() => validateTestEnvironment()).toThrow(
      'Execução e2e recusada: DATABASE_URL_TEST não definida',
    );
  });

  // C - Banco chamado 'loopclub' (proibido)
  it('deve recusar banco chamado "loopclub"', () => {
    process.env.DATABASE_URL_TEST =
      'postgresql://user:pass@localhost:5432/loopclub?schema=public';

    expect(() => validateTestEnvironment()).toThrow(
      'banco de testes não autorizado',
    );
  });

  // D - Banco sem sufixo _e2e nem _test
  it('deve recusar banco sem sufixo _e2e ou _test', () => {
    process.env.DATABASE_URL_TEST =
      'postgresql://user:pass@localhost:5432/loopclub_prod?schema=public';

    expect(() => validateTestEnvironment()).toThrow(
      'banco de testes não autorizado',
    );
  });

  // E - Banco de teste igual ao banco configurado em DATABASE_URL
  it('deve recusar DATABASE_URL_TEST igual a DATABASE_URL', () => {
    process.env.DATABASE_URL = VALID_TEST_URL;
    process.env.DATABASE_URL_TEST = VALID_TEST_URL;

    expect(() => validateTestEnvironment()).toThrow(
      'banco de testes não autorizado',
    );
  });

  // F - Host não autorizado (ex: production-host)
  it('deve recusar host fora da allowlist', () => {
    process.env.DATABASE_URL_TEST =
      'postgresql://user:pass@prod-server.example.com:5432/loopclub_e2e?schema=public';

    expect(() => validateTestEnvironment()).toThrow(
      'banco de testes não autorizado',
    );
  });

  // G - URL inválida (não parseável)
  it('deve recusar URL inválida', () => {
    process.env.DATABASE_URL_TEST = 'not-a-valid-url';

    expect(() => validateTestEnvironment()).toThrow(
      'banco de testes não autorizado',
    );
  });

  // H - DATABASE_URL_TEST vazia (string vazia)
  it('deve recusar DATABASE_URL_TEST vazia', () => {
    process.env.DATABASE_URL_TEST = '';

    expect(() => validateTestEnvironment()).toThrow(
      'Execução e2e recusada: DATABASE_URL_TEST não definida',
    );
  });

  // Contraprova: ambiente válido não deve lançar erro
  it('deve aceitar ambiente válido', () => {
    process.env.DATABASE_URL_TEST = VALID_TEST_URL;
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/outro_banco_dev?schema=public';

    // Não deve lançar
    validateTestEnvironment();

    // Contraprova: DATABASE_URL deve ter sido redirecionada
    expect(process.env.DATABASE_URL).toBe(VALID_TEST_URL);
  });
});