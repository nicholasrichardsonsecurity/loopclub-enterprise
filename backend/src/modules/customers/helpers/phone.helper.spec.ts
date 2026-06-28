import {
  normalizeBrazilianPhoneToE164,
  formatBrazilianPhone,
  PhoneError,
} from './phone.helper';

describe('normalizeBrazilianPhoneToE164', () => {
  // --- Celular (11 dígitos nacionais) ---
  it('deve normalizar celular com máscara', () => {
    expect(normalizeBrazilianPhoneToE164('(81) 99999-1234')).toBe('+5581999991234');
  });

  it('deve normalizar celular sem máscara', () => {
    expect(normalizeBrazilianPhoneToE164('81999991234')).toBe('+5581999991234');
  });

  it('deve normalizar celular com +55 e máscara', () => {
    expect(normalizeBrazilianPhoneToE164('+55 81 99999-1234')).toBe('+5581999991234');
  });

  it('deve normalizar celular com +55 sem máscara', () => {
    expect(normalizeBrazilianPhoneToE164('+5581999991234')).toBe('+5581999991234');
  });

  it('deve normalizar celular com 55 (sem +) e sem máscara', () => {
    expect(normalizeBrazilianPhoneToE164('5581999991234')).toBe('+5581999991234');
  });

  it('deve normalizar celular com espaços', () => {
    expect(normalizeBrazilianPhoneToE164('81 99999 1234')).toBe('+5581999991234');
  });

  it('deve normalizar celular com hífen', () => {
    expect(normalizeBrazilianPhoneToE164('81-99999-1234')).toBe('+5581999991234');
  });

  it('deve normalizar celular com pontos', () => {
    expect(normalizeBrazilianPhoneToE164('(81) 9.9999-1234')).toBe('+5581999991234');
  });

  // --- Telefone fixo (10 dígitos nacionais) ---
  it('deve normalizar telefone fixo', () => {
    expect(normalizeBrazilianPhoneToE164('(81) 3456-7890')).toBe('+558134567890');
  });

  it('deve normalizar telefone fixo com +55', () => {
    expect(normalizeBrazilianPhoneToE164('+558134567890')).toBe('+558134567890');
  });

  // --- Casos de erro ---
  it('deve rejeitar celular sem nono dígito', () => {
    expect(() => normalizeBrazilianPhoneToE164('(81) 9999-1234')).toThrow(PhoneError);
  });

  it('deve rejeitar DDD inválido', () => {
    expect(() => normalizeBrazilianPhoneToE164('(00) 99999-1234')).toThrow(PhoneError);
  });

  it('deve rejeitar DDD ausente', () => {
    expect(() => normalizeBrazilianPhoneToE164('999991234')).toThrow(PhoneError);
  });

  it('deve rejeitar número curto', () => {
    expect(() => normalizeBrazilianPhoneToE164('1234')).toThrow(PhoneError);
  });

  it('deve rejeitar número longo demais', () => {
    expect(() => normalizeBrazilianPhoneToE164('12345678901234567890')).toThrow(PhoneError);
  });

  it('deve rejeitar letras', () => {
    expect(() => normalizeBrazilianPhoneToE164('(81) 99999-ABCD')).toThrow(PhoneError);
  });

  it('deve rejeitar string vazia', () => {
    expect(() => normalizeBrazilianPhoneToE164('')).toThrow(PhoneError);
  });

  it('deve rejeitar null', () => {
    expect(() => normalizeBrazilianPhoneToE164(null as unknown as string)).toThrow(PhoneError);
  });

  it('deve rejeitar undefined', () => {
    expect(() => normalizeBrazilianPhoneToE164(undefined as unknown as string)).toThrow(PhoneError);
  });

  it('deve rejeitar sequência repetida', () => {
    expect(() => normalizeBrazilianPhoneToE164('11999999999')).toThrow(PhoneError);
  });

  it('deve sempre retornar formato E.164 começando com +55', () => {
    const result = normalizeBrazilianPhoneToE164('11987654321');
    expect(result).toMatch(/^\+55\d{10,11}$/);
  });

  it('deve aceitar celular com 8 como nono dígito (Vivo)', () => {
    expect(normalizeBrazilianPhoneToE164('11981234567')).toBe('+5511981234567');
  });

  it('deve rejeitar código de país diferente de 55', () => {
    expect(() => normalizeBrazilianPhoneToE164('+1 81 99999-1234')).toThrow(PhoneError);
  });
});

describe('formatBrazilianPhone', () => {
  it('deve formatar celular para exibição', () => {
    expect(formatBrazilianPhone('+5581999991234')).toBe('(81) 99999-1234');
  });

  it('deve formatar telefone fixo para exibição', () => {
    expect(formatBrazilianPhone('+558134567890')).toBe('(81) 3456-7890');
  });

  it('deve lançar erro para formato inválido', () => {
    expect(() => formatBrazilianPhone('+551234')).toThrow(PhoneError);
  });

  it('deve lançar erro para null', () => {
    expect(() => formatBrazilianPhone(null as unknown as string)).toThrow(PhoneError);
  });
});