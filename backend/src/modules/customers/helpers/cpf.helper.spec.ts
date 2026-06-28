import {
  normalizeCpf,
  isValidCpf,
  generateCpfLookupHash,
  getCpfLastDigits,
  compareCpfHash,
  CpfError,
} from './cpf.helper';

const TEST_SECRET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const SHORT_SECRET = 'too-short';

describe('normalizeCpf', () => {
  it('deve normalizar CPF sem máscara', () => {
    expect(normalizeCpf('52998224725')).toBe('52998224725');
  });

  it('deve normalizar CPF com máscara', () => {
    expect(normalizeCpf('529.982.247-25')).toBe('52998224725');
  });

  it('deve lançar erro para CPF curto', () => {
    expect(() => normalizeCpf('123456')).toThrow(CpfError);
  });

  it('deve lançar erro para CPF longo', () => {
    expect(() => normalizeCpf('123456789012')).toThrow(CpfError);
  });

  it('deve lançar erro para string vazia', () => {
    expect(() => normalizeCpf('')).toThrow(CpfError);
  });

  it('deve lançar erro para letras', () => {
    expect(() => normalizeCpf('abc.def.ghi-jk')).toThrow(CpfError);
  });

  it('deve lançar erro para null', () => {
    expect(() => normalizeCpf(null as unknown as string)).toThrow(CpfError);
  });

  it('deve lançar erro para undefined', () => {
    expect(() => normalizeCpf(undefined as unknown as string)).toThrow(CpfError);
  });

  it('deve rejeitar todos os dígitos iguais', () => {
    expect(() => normalizeCpf('11111111111')).toThrow(CpfError);
  });
});

describe('isValidCpf', () => {
  // CPFs com dígitos verificadores válidos, conhecidos
  it('deve validar CPF válido sem máscara', () => {
    expect(isValidCpf('52998224725')).toBe(true);
  });

  it('deve validar CPF válido com máscara', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true);
  });

  // CPF gerado por algoritmo de dígitos verificadores
  // (não é CPF real — usado exclusivamente em testes)
  it('deve validar outro CPF válido', () => {
    expect(isValidCpf('25487703116')).toBe(true);
  });

  it('deve validar mais um CPF válido', () => {
    expect(isValidCpf('54173606354')).toBe(true);
  });

  it('deve rejeitar CPF com primeiro dígito verificador inválido', () => {
    expect(isValidCpf('52998224726')).toBe(false);
  });

  it('deve rejeitar CPF com segundo dígito verificador inválido', () => {
    expect(isValidCpf('52998224724')).toBe(false);
  });

  it('deve rejeitar todos os dígitos iguais', () => {
    expect(isValidCpf('11111111111')).toBe(false);
  });

  it('deve rejeitar CPF curto', () => {
    expect(isValidCpf('123456')).toBe(false);
  });

  it('deve rejeitar CPF com letras', () => {
    expect(isValidCpf('abc.def.ghi-jk')).toBe(false);
  });

  it('deve rejeitar string vazia', () => {
    expect(isValidCpf('')).toBe(false);
  });

  it('deve rejeitar null', () => {
    expect(isValidCpf(null as unknown as string)).toBe(false);
  });
});

describe('generateCpfLookupHash', () => {
  it('deve gerar hash determinístico para mesmo CPF e mesmo secret', () => {
    const hash1 = generateCpfLookupHash('52998224725', TEST_SECRET);
    const hash2 = generateCpfLookupHash('52998224725', TEST_SECRET);
    expect(hash1).toBe(hash2);
  });

  it('deve gerar hashes diferentes com secrets diferentes', () => {
    const hash1 = generateCpfLookupHash('52998224725', TEST_SECRET);
    const hash2 = generateCpfLookupHash('52998224725', TEST_SECRET + 'x');
    expect(hash1).not.toBe(hash2);
  });

  it('deve produzir mesmo hash para CPF com e sem máscara', () => {
    const hash1 = generateCpfLookupHash('52998224725', TEST_SECRET);
    const hash2 = generateCpfLookupHash('529.982.247-25', TEST_SECRET);
    expect(hash1).toBe(hash2);
  });

  it('deve retornar hash em hex de 64 caracteres', () => {
    const hash = generateCpfLookupHash('52998224725', TEST_SECRET);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('deve lançar erro com secret ausente', () => {
    expect(() => generateCpfLookupHash('52998224725', '')).toThrow(CpfError);
  });

  it('deve lançar erro com secret curto', () => {
    expect(() => generateCpfLookupHash('52998224725', SHORT_SECRET)).toThrow(CpfError);
  });

  it('deve lançar erro com CPF inválido mesmo com secret válido', () => {
    expect(() => generateCpfLookupHash('123', TEST_SECRET)).toThrow(CpfError);
  });
});

describe('compareCpfHash', () => {
  it('deve retornar true para hashes iguais', () => {
    const hash = generateCpfLookupHash('52998224725', TEST_SECRET);
    expect(compareCpfHash(hash, hash)).toBe(true);
  });

  it('deve retornar false para hashes diferentes', () => {
    const hash1 = generateCpfLookupHash('52998224725', TEST_SECRET);
    const hash2 = generateCpfLookupHash('94271623890', TEST_SECRET);
    expect(compareCpfHash(hash1, hash2)).toBe(false);
  });

  it('deve retornar false para hashes de tamanhos diferentes', () => {
    expect(compareCpfHash('abc', 'defgh')).toBe(false);
  });
});

describe('getCpfLastDigits', () => {
  it('deve retornar os últimos 4 dígitos do CPF', () => {
    expect(getCpfLastDigits('52998224725')).toBe('4725');
  });

  it('deve funcionar com CPF mascarado', () => {
    expect(getCpfLastDigits('529.982.247-25')).toBe('4725');
  });

  it('deve lançar erro para CPF inválido', () => {
    expect(() => getCpfLastDigits('123')).toThrow(CpfError);
  });
});