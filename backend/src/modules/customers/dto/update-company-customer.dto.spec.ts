import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateCompanyCustomerDto } from './update-company-customer.dto';

describe('UpdateCompanyCustomerDto', () => {
  const makeDto = (obj: Record<string, unknown>) => plainToInstance(UpdateCompanyCustomerDto, obj);

  it('rejects empty object (no fields)', async () => {
    const dto = makeDto({});
    const errors = await validate(dto);
    // expects AtLeastOneField constraint error
    expect(errors).toHaveLength(1);
  });

  it('accepts internalCode alone', async () => {
    const dto = makeDto({ internalCode: 'ABC' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts notes alone', async () => {
    const dto = makeDto({ notes: 'Observação' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts both fields together', async () => {
    const dto = makeDto({ internalCode: 'ABC', notes: 'Obs' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts null for internalCode', async () => {
    const dto = makeDto({ internalCode: null });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts null for notes', async () => {
    const dto = makeDto({ notes: null });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts both null', async () => {
    const dto = makeDto({ internalCode: null, notes: null });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects empty string for internalCode after trim', async () => {
    const dto = makeDto({ internalCode: '   ' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('internalCode');
  });

  it('rejects empty string for notes after trim', async () => {
    const dto = makeDto({ notes: '' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('notes');
  });

  it('trims strings before validation', async () => {
    const dto = makeDto({ internalCode: '  abc  ', notes: '  note  ' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.internalCode).toBe('abc');
    expect(dto.notes).toBe('note');
  });

  it('accepts internalCode with 30 characters', async () => {
    const value = 'a'.repeat(30);
    const dto = makeDto({ internalCode: value });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects internalCode with 31 characters', async () => {
    const value = 'a'.repeat(31);
    const dto = makeDto({ internalCode: value });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'internalCode')).toBe(true);
  });

  it('accepts notes with 500 characters', async () => {
    const value = 'b'.repeat(500);
    const dto = makeDto({ notes: value });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects notes with 501 characters', async () => {
    const value = 'b'.repeat(501);
    const dto = makeDto({ notes: value });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'notes')).toBe(true);
  });

  it('rejects numeric types for internalCode and notes', async () => {
    const dto = makeDto({ internalCode: 123, notes: 456 });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'internalCode')).toBe(true);
    expect(errors.some(e => e.property === 'notes')).toBe(true);
  });

  it('rejects extra unexpected fields', async () => {
    const dto = makeDto({ internalCode: 'code', extra: 'value' });
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.some(e => e.property === 'extra')).toBe(true);
  });

  it('rejects prohibited fields (name, email, birthDate, phone, cpf, status, source, joinedAt, lastAttendedAt, companyId, customerId)', async () => {
    const dto = makeDto({
      internalCode: 'code',
      name: 'test',
      email: 'a@b.c',
      birthDate: '2000-01-01',
      phone: '123',
      cpf: '11122233344',
      status: 'active',
      source: 'manual',
      joinedAt: '2023-01-01',
      lastAttendedAt: '2023-01-02',
      companyId: 'c1',
      customerId: 'cust1',
    });
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
    const prohibited = [
      'name',
      'email',
      'birthDate',
      'phone',
      'cpf',
      'status',
      'source',
      'joinedAt',
      'lastAttendedAt',
      'companyId',
      'customerId',
    ];
    // Verifica individualmente que cada campo proibido gera erro
    for (const field of prohibited) {
      expect(errors.some(e => e.property === field)).toBe(true);
    }
  });
});
