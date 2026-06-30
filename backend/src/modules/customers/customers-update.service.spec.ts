// Testes unitários isolados para o método updateCompanyCustomer
import { CustomersService } from './customers.service';
import { UpdateCompanyCustomerDto } from './dto/update-company-customer.dto';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma.service';

const HMAC_SECRET = 'abcdefghijklmnopqrstuvwxyz0123456789';

// Mocks de Prisma
const mockCompanyFindUnique = jest.fn();
const mockCompanyUserFindUnique = jest.fn();
const mockCompanyCustomerFindFirst = jest.fn();
const mockCompanyCustomerUpdate = jest.fn();
const mockAuditLogCreate = jest.fn();
const mock$transaction = jest.fn().mockImplementation((fn: any) => {
  const tx = {
    companyCustomer: { update: mockCompanyCustomerUpdate },
    auditLog: { create: mockAuditLogCreate },
  };
  return fn(tx);
});

// Mock da classe PrismaService
jest.mock('../../prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({
    company: { findUnique: mockCompanyFindUnique },
    companyUser: { findUnique: mockCompanyUserFindUnique },
    companyCustomer: { findFirst: mockCompanyCustomerFindFirst, update: mockCompanyCustomerUpdate },
    auditLog: { create: mockAuditLogCreate },
    $transaction: mock$transaction,
  })),
}));

// Mock de ConfigService
const mockConfigGet = jest.fn();
jest.mock('@nestjs/config', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({ get: mockConfigGet })),
}));

describe('CustomersService – updateCompanyCustomer (arquivo isolado)', () => {
  let service: CustomersService;
  const COMPANY_ID = 'company-alpha';
  const ACTOR_USER_ID = 'user-actor';

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfigGet.mockReturnValue(HMAC_SECRET);
    // empresa e vínculo válidos por padrão
    mockCompanyFindUnique.mockResolvedValue({ id: COMPANY_ID, status: 'active' });
    mockCompanyUserFindUnique.mockResolvedValue({ status: 'active', role: 'owner' });
    const { PrismaService } = require('../../prisma.service');
    const { ConfigService } = require('@nestjs/config');
    service = new CustomersService(new PrismaService(), new ConfigService());
  });

  // Link base usado nos testes
  const baseLink = {
    id: 'cc-1',
    internalCode: 'CODIGO-ANTIGO',
    notes: 'Nota antiga',
    status: 'active',
    source: 'manual',
    joinedAt: new Date(),
    lastAttendedAt: null,
    customer: { name: 'João', phoneE164: '+5581999991234', emailNormalized: null },
  };

  it('atualiza apenas internalCode', async () => {
    const dto: UpdateCompanyCustomerDto = { internalCode: 'CODIGO-NOVO' };
    mockCompanyCustomerFindFirst.mockResolvedValue({ ...baseLink });
    const updated = { ...baseLink, internalCode: 'CODIGO-NOVO' };
    mockCompanyCustomerUpdate.mockResolvedValue(updated);
    mockAuditLogCreate.mockResolvedValue({});

    const result = await service.updateCompanyCustomer(COMPANY_ID, ACTOR_USER_ID, 'cc-1', 'company_owner', dto);

    expect(mockCompanyCustomerUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cc-1' },
        data: { internalCode: 'CODIGO-NOVO' },
      }),
    );
    expect(result.internalCode).toBe('CODIGO-NOVO');
    expect(result.notes).toBe('Nota antiga');
  });

  it('atualiza apenas notes', async () => {
    const dto: UpdateCompanyCustomerDto = { notes: 'Nota nova' };
    mockCompanyCustomerFindFirst.mockResolvedValue({ ...baseLink });
    const updated = { ...baseLink, notes: 'Nota nova' };
    mockCompanyCustomerUpdate.mockResolvedValue(updated);
    mockAuditLogCreate.mockResolvedValue({});

    const result = await service.updateCompanyCustomer(COMPANY_ID, ACTOR_USER_ID, 'cc-1', 'company_owner', dto);

    expect(mockCompanyCustomerUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cc-1' },
        data: { notes: 'Nota nova' },
      }),
    );
    expect(result.notes).toBe('Nota nova');
    expect(result.internalCode).toBe('CODIGO-ANTIGO');
  });

  it('internalCode null remove somente internalCode', async () => {
    const dto: UpdateCompanyCustomerDto = { internalCode: null };
    mockCompanyCustomerFindFirst.mockResolvedValue({ ...baseLink });
    const updated = { ...baseLink, internalCode: null };
    mockCompanyCustomerUpdate.mockResolvedValue(updated);
    mockAuditLogCreate.mockResolvedValue({});

    const result = await service.updateCompanyCustomer(COMPANY_ID, ACTOR_USER_ID, 'cc-1', 'company_owner', dto);

    expect(mockCompanyCustomerUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { internalCode: null } }),
    );
    expect(result.internalCode).toBeNull();
    expect(result.notes).toBe('Nota antiga');
  });

  it('notes null remove somente notes', async () => {
    const dto: UpdateCompanyCustomerDto = { notes: null };
    mockCompanyCustomerFindFirst.mockResolvedValue({ ...baseLink });
    const updated = { ...baseLink, notes: null };
    mockCompanyCustomerUpdate.mockResolvedValue(updated);
    mockAuditLogCreate.mockResolvedValue({});

    const result = await service.updateCompanyCustomer(COMPANY_ID, ACTOR_USER_ID, 'cc-1', 'company_owner', dto);

    expect(mockCompanyCustomerUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { notes: null } }),
    );
    expect(result.notes).toBeNull();
    expect(result.internalCode).toBe('CODIGO-ANTIGO');
  });

  it('campo ausente preserva o outro valor', async () => {
    const dto: UpdateCompanyCustomerDto = {} as UpdateCompanyCustomerDto; // nenhum campo enviado
    mockCompanyCustomerFindFirst.mockResolvedValue({ ...baseLink });
    mockAuditLogCreate.mockResolvedValue({});
    // método update não deve ser chamado
    const result = await service.updateCompanyCustomer(COMPANY_ID, ACTOR_USER_ID, 'cc-1', 'company_owner', dto);

    expect(mockCompanyCustomerUpdate).not.toHaveBeenCalled();
    expect(result.internalCode).toBe('CODIGO-ANTIGO');
    expect(result.notes).toBe('Nota antiga');
  });

  it('busca usa id + companyId', async () => {
    const dto: UpdateCompanyCustomerDto = { notes: 'alguma' };
    mockCompanyCustomerFindFirst.mockResolvedValue({ ...baseLink });
    const updated = { ...baseLink, notes: 'alguma' };
    mockCompanyCustomerUpdate.mockResolvedValue(updated);
    mockAuditLogCreate.mockResolvedValue({});

    await service.updateCompanyCustomer(COMPANY_ID, ACTOR_USER_ID, 'cc-1', 'company_owner', dto);

    expect(mockCompanyCustomerUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'cc-1' } }),
    );
  });
});
