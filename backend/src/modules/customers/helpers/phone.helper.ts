const BRAZILIAN_VALID_DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  21, 22, 24, 27, 28,
  31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55,
  61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79,
  81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

export class PhoneError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PhoneError';
  }
}

function stripPhone(input: string): string {
  return input.replace(/[\s\-()./+]/g, '');
}

/**
 * Normaliza um telefone brasileiro para o formato E.164 (+55XXXXXXXXXXX).
 *
 * Aceita celular (11 dígitos nacionais) e fixo (10 dígitos nacionais).
 * O código do país +55 é opcional na entrada, mas sempre incluído na saída.
 */
export function normalizeBrazilianPhoneToE164(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new PhoneError('Telefone inválido');
  }

  const digits = input.replace(/[\s\-()./+]/g, '');

  if (!/^\d{10,13}$/.test(digits)) {
    throw new PhoneError('Telefone inválido');
  }

  if (!/^\d+$/.test(digits)) {
    throw new PhoneError('Telefone inválido');
  }

  let national: string;

  if (digits.length === 13) {
    // +55 XX XXXX-XXXX or +55 XX XXXXX-XXXX
    if (!digits.startsWith('55')) {
      throw new PhoneError('Telefone inválido');
    }
    national = digits.slice(2);
  } else if (digits.length === 12) {
    // 55 XX XXXX-XXXX or 55 XX XXXXX-XXXX
    if (!digits.startsWith('55')) {
      throw new PhoneError('Telefone inválido');
    }
    national = digits.slice(2);
  } else if (digits.length >= 10 && digits.length <= 11) {
    national = digits;
  } else {
    throw new PhoneError('Telefone inválido');
  }

  if (national.length !== 10 && national.length !== 11) {
    throw new PhoneError('Telefone inválido');
  }

  const ddd = parseInt(national.slice(0, 2), 10);

  if (!BRAZILIAN_VALID_DDDS.has(ddd)) {
    throw new PhoneError('Telefone inválido');
  }

  // Celular: 11 dígitos nacionais, nono dígito obrigatório (começa com 9 após DDD)
  // Fixo: 10 dígitos nacionais
  if (national.length === 11) {
    if (national[2] !== '9' && national[2] !== '8') {
      throw new PhoneError('Telefone inválido');
    }
  } else if (national.length === 10 && national[2] === '9') {
    // 10 dígitos começando com 9 após DDD = celular sem nono dígito
    throw new PhoneError('Telefone inválido');
  }

  // Rejeitar números onde o DDD + todos os demais dígitos são a mesma sequência
  // Ex: 11999999999 → DDD 11 + resto 999999999 (todos 9)
  // Ex: 81333333333 → DDD 81 + resto 333333333 (todos 3)
  const rest = national.slice(2);
  if (/^(\d)\1+$/.test(rest)) {
    throw new PhoneError('Telefone inválido');
  }

  return '+55' + national;
}

/**
 * Formata um telefone em E.164 para exibição amigável.
 * Exemplo: +5581999991234 → (81) 99999-1234
 */
export function formatBrazilianPhone(phoneE164: string): string {
  if (!phoneE164 || typeof phoneE164 !== 'string') {
    throw new PhoneError('Telefone inválido');
  }

  const national = phoneE164.replace(/^\+55/, '');

  if (national.length !== 10 && national.length !== 11) {
    throw new PhoneError('Telefone inválido');
  }

  const ddd = national.slice(0, 2);
  const rest = national.slice(2);

  if (rest.length === 9) {
    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  }

  // Fixo: (XX) XXXX-XXXX
  return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
}
