import { createHmac, timingSafeEqual } from 'crypto';

const CPF_REGEX = /^\d{11}$/;
const MIN_SECRET_LENGTH = 32;

export class CpfError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CpfError';
  }
}

/**
 * Remove qualquer máscara de um CPF e retorna apenas os 11 dígitos.
 * Lança CpfError se não for possível extrair 11 dígitos.
 */
export function normalizeCpf(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new CpfError('CPF inválido');
  }

  const digits = input.replace(/\D/g, '');

  if (!CPF_REGEX.test(digits)) {
    throw new CpfError('CPF inválido');
  }

  // Rejeitar sequências de dígitos repetidos
  if (/^(\d)\1+$/.test(digits)) {
    throw new CpfError('CPF inválido');
  }

  return digits;
}

/**
 * Valida os dígitos verificadores de um CPF.
 * Aceita CPF com ou sem máscara.
 */
export function isValidCpf(input: string): boolean {
  let digits: string;
  try {
    digits = normalizeCpf(input);
  } catch {
    return false;
  }

  // Cálculo do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i], 10) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  const digit1 = remainder === 10 ? 0 : remainder;

  if (parseInt(digits[9], 10) !== digit1) {
    return false;
  }

  // Cálculo do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i], 10) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  const digit2 = remainder === 10 ? 0 : remainder;

  return parseInt(digits[10], 10) === digit2;
}

/**
 * Gera HMAC-SHA-256 do CPF normalizado para lookup seguro.
 *
 * O secret é obrigatório e deve ter no mínimo 32 caracteres.
 * O HMAC resultante é um digest hex de 64 caracteres.
 */
export function generateCpfLookupHash(input: string, secret: string): string {
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new CpfError('Segredo HMAC inválido ou muito curto');
  }

  const digits = normalizeCpf(input);

  return createHmac('sha256', secret).update(digits, 'utf-8').digest('hex');
}

/**
 * Compara dois hashes HMAC de CPF usando timing-safe comparison.
 */
export function compareCpfHash(hashA: string, hashB: string): boolean {
  if (hashA.length !== hashB.length) {
    return false;
  }
  try {
    return timingSafeEqual(Buffer.from(hashA, 'hex'), Buffer.from(hashB, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Retorna apenas os 4 últimos dígitos de um CPF para exibição parcial.
 */
export function getCpfLastDigits(input: string): string {
  const digits = normalizeCpf(input);
  return digits.slice(-4);
}