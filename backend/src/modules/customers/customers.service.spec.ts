import { CustomersService, CreateCustomerResult } from './customers.service';
import { BadRequestException, ConflictException, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

const HMAC_SECRET = 'abcdefghijklmnopqrstuvwxyz0123456789';

// Prisma mock
const mockCompanyFindUnique = jest.fn();
const mockCompanyUserFindUnique = jest.fn();
const mockCustomerFindUnique = jest.fn();
const mockCustomerCreate = jest.fn();
const mockCompanyCustomerFindUnique = jest.fn();
const mockCompanyCustomerCreate = jest.fn();
const mockCompanyCustomerFindMany = jest.fn();
const mockCompanyCustomerCount = jest.fn();
const mockCompanyCustomerFindFirst = jest.fn();
const mockAuditLogCreate = jest.fn();
const mock$transaction = jest.fn();

jest.mock('../../prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({
    company: {
      findUnique: mockCompanyFindUnique,
    },
    companyUser: {
      findUnique: mockCompanyUserFindUnique,
    },
    customer: {
      findUnique: mockCustomerFindUnique,
      create: mockCustomerCreate,
    },
    companyCustomer: {
      findUnique: mockCompanyCustomerFindUnique,
      create: mockCompanyCustomerCreate,
      findMany: mockCompanyCustomerFindMany,
      count: mockCompanyCustomerCount,
      findFirst: mockCompanyCustomerFindFirst,
    },
    auditLog: {
      create: mockAuditLogCreate,
    },
    $transaction: mock$transaction,
  })),
}));

// Config mock
const mockConfigGet = jest.fn();
jest.mock('@nestjs/config', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({
    get: mockConfigGet,
  })),
}));

describe('CustomersService', () => {
  let service: CustomersService;

  const COMPANY_ID = 'company-alpha';
  const ACTOR_USER_ID = 'user-actor';
  const BASE_DTO = {
    name: 'João Silva',
    phone: '(81) 99999-1234',
  };

  const mockCustomer = (overrides = {}) => ({
    id: 'cust-global-1',
    name: 'João Silva',
    phoneE164: '+5581999991234',
    emailNormalized: null,
    cpfLookupHash: null,
    cpfLastDigits: null,
    birthDate: null,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: null,
    ...overrides,
  });

  const mockCompanyCustomer = (overrides = {}) => ({
    id: 'cc-1',
    customerId: 'cust-global-1',
    companyId: COMPANY_ID,
    internalCode: null,
    status: 'active',
    source: 'manual',
    notes: null,
    joinedAt: new Date(),
    lastAttendedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const runTransaction = (fn: (tx: any) => Promise<CreateCustomerResult>) => {
    return fn({
      customer: {
        findUnique: mockCustomerFindUnique,
        create: mockCustomerCreate,
      },
      companyCustomer: {
        findUnique: mockCompanyCustomerFindUnique,
        create: mockCompanyCustomerCreate,
      },
      auditLog: {
        create: mockAuditLogCreate,
      },
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfigGet.mockReturnValue(HMAC_SECRET);
    mock$transaction.mockImplementation((fn: any) => runTransaction(fn));

    // Valid company + active link by default
    mockCompanyFindUnique.mockResolvedValue({ id: COMPANY_ID, status: 'active' });
    mockCompanyUserFindUnique.mockResolvedValue({ status: 'active', role: 'owner' });

    const { PrismaService } = require('../../prisma.service');
    const { ConfigService } = require('@nestjs/config');
    service = new CustomersService(new PrismaService(), new ConfigService());
  });

  // ===== Validação de empresa e ator =====
  describe('validação de empresa e ator', () => {
    it('deve rejeitar empresa inexistente', async () => {
      mockCompanyFindUnique.mockResolvedValue(null);

      await expect(
        service.createForCompany(COMPANY_ID, ACTOR_USER_ID, BASE_DTO),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve rejeitar empresa inativa', async () => {
      mockCompanyFindUnique.mockResolvedValue({ id: COMPANY_ID, status: 'blocked' });

      await expect(
        service.createForCompany(COMPANY_ID, ACTOR_USER_ID, BASE_DTO),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve rejeitar ator sem CompanyUser', async () => {
      mockCompanyUserFindUnique.mockResolvedValue(null);

      await expect(
        service.createForCompany(COMPANY_ID, ACTOR_USER_ID, BASE_DTO),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve rejeitar CompanyUser inativo', async () => {
      mockCompanyUserFindUnique.mockResolvedValue({ status: 'blocked', role: 'employee' });

      await expect(
        service.createForCompany(COMPANY_ID, ACTOR_USER_ID, BASE_DTO),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ===== Validação de birthDate =====
  describe('validação de birthDate', () => {
    it('deve aceitar birthDate válida', async () => {
      mockCustomerFindUnique.mockResolvedValue(null);
      mockCustomerCreate.mockResolvedValue(mockCustomer({ birthDate: new Date('1990-05-15') }));
      mockCompanyCustomerFindUnique.mockResolvedValue(null);
      mockCompanyCustomerCreate.mockResolvedValue(mockCompanyCustomer());
      mockAuditLogCreate.mockResolvedValue({});

      const result = await service.createForCompany(COMPANY_ID, ACTOR_USER_ID, {
        ...BASE_DTO,
        birthDate: '1990-05-15',
      });

      expect(mockCustomerCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ birthDate: new Date(Date.UTC(1990, 4, 15)) }),
        }),
      );
    });

    it('deve rejeitar formato inválido (DD/MM/AAAA)', async () => {
      await expect(
        service.createForCompany(COMPANY_ID, ACTOR_USER_ID, {
          ...BASE_DTO,
          birthDate: '15/05/1990',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve rejeitar data inexistente', async () => {
      await expect(
        service.createForCompany(COMPANY_ID, ACTOR_USER_ID, {
          ...BASE_DTO,
          birthDate: '1990-02-30',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve rejeitar data futura', async () => {
      await expect(
        service.createForCompany(COMPANY_ID, ACTOR_USER_ID, {
          ...BASE_DTO,
          birthDate: '2099-01-01',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve rejeitar limite histórico inválido', async () => {
      await expect(
        service.createForCompany(COMPANY_ID, ACTOR_USER_ID, {
          ...BASE_DTO,
          birthDate: '1800-01-01',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ===== CPF conflitante em Customer NOVO =====
  describe('CPF conflitante', () => {
    it('deve rejeitar CPF que colide com outro Customer no create', async () => {
      mockCustomerFindUnique.mockResolvedValue(null);
      mockCustomerCreate.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: '5.22.0',
          meta: { target: ['cpfLookupHash'] },
        }),
      );

      await expect(
        service.createForCompany(COMPANY_ID, ACTOR_USER_ID, {
          ...BASE_DTO,
          cpf: '52998224725',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('deve rejeitar CPF que não corresponde ao Customer existente', async () => {
      mockCustomerFindUnique.mockResolvedValue(
        mockCustomer({ cpfLookupHash: 'hash-muito-diferente-de-outro-cpf', cpfLastDigits: '0001' }),
      );

      await expect(
        service.createForCompany(COMPANY_ID, ACTOR_USER_ID, {
          ...BASE_DTO,
          cpf: '52998224725',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ===== Erros P2002 específicos e seguros =====
  describe('tratamento de erros P2002', () => {
    it('PHONE: colisão phoneE164 deve reler e reutilizar', async () => {
      let callCount = 0;
      mockCustomerFindUnique.mockImplementation(() => {
        callCount++;
        return callCount === 1 ? null : mockCustomer();
      });
      mockCustomerCreate.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: '5.22.0',
          meta: { target: ['phoneE164'] },
        }),
      );
      mockCompanyCustomerFindUnique.mockResolvedValue(null);
      mockCompanyCustomerCreate.mockResolvedValue(mockCompanyCustomer());
      mockAuditLogCreate.mockResolvedValue({});

      const result = await service.createForCompany(COMPANY_ID, ACTOR_USER_ID, BASE_DTO);

      expect(result.isNewCustomer).toBe(false);
    });

    it('CPF: colisão cpfLookupHash deve retornar ConflictException sem expor detalhes', async () => {
      mockCustomerFindUnique.mockResolvedValue(null);
      mockCustomerCreate.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: '5.22.0',
          meta: { target: ['cpfLookupHash'] },
        }),
      );

      const promise = service.createForCompany(COMPANY_ID, ACTOR_USER_ID, {
        ...BASE_DTO,
        cpf: '52998224725',
      });

      await expect(promise).rejects.toThrow(ConflictException);
      await expect(promise).rejects.not.toThrow(/cpfLookupHash/i);
    });

    it('VINCULO: colisão customerId_companyId deve retornar ConflictException segura', async () => {
      mockCustomerFindUnique.mockResolvedValue(mockCustomer());
      mockCompanyCustomerFindUnique.mockResolvedValue(null);
      mockCompanyCustomerCreate.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: '5.22.0',
          meta: { target: ['customerId_companyId'] },
        }),
      );

      const promise = service.createForCompany(COMPANY_ID, ACTOR_USER_ID, BASE_DTO);

      await expect(promise).rejects.toThrow(ConflictException);
      await expect(promise).rejects.not.toThrow(/customerId_companyId/i);
    });

    it('INTERNAL_CODE: colisão companyId_internalCode deve retornar ConflictException segura', async () => {
      mockCustomerFindUnique.mockResolvedValue(mockCustomer());
      mockCompanyCustomerFindUnique.mockResolvedValueOnce(null); // vínculo não existe
      mockCompanyCustomerCreate.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: '5.22.0',
          meta: { target: ['companyId_internalCode'] },
        }),
      );

      const promise = service.createForCompany(COMPANY_ID, ACTOR_USER_ID, {
        ...BASE_DTO,
        internalCode: 'CLI-001',
      });

      await expect(promise).rejects.toThrow(ConflictException);
      await expect(promise).rejects.not.toThrow(/companyId_internalCode/i);
    });
  });

  // ===== Auditoria atômica =====
  describe('auditoria atômica', () => {
    it('deve executar rollback se auditLog.create falhar', async () => {
      mockCustomerFindUnique.mockResolvedValue(null);
      mockCustomerCreate.mockResolvedValue(mockCustomer());
      mockCompanyCustomerFindUnique.mockResolvedValue(null);
      mockCompanyCustomerCreate.mockResolvedValue(mockCompanyCustomer());
      mockAuditLogCreate.mockRejectedValue(new Error('DB write failed'));

      await expect(
        service.createForCompany(COMPANY_ID, ACTOR_USER_ID, BASE_DTO),
      ).rejects.toThrow('DB write failed');

      // $transaction rollback é garantido pelo Prisma — o teste comprova
      // que o erro NÃO foi engolido
    });
  });

  // ===== Customer novo =====
  it('deve criar Customer novo e CompanyCustomer', async () => {
    mockCustomerFindUnique.mockResolvedValue(null);
    mockCustomerCreate.mockResolvedValue(mockCustomer());
    mockCompanyCustomerFindUnique.mockResolvedValue(null);
    mockCompanyCustomerCreate.mockResolvedValue(mockCompanyCustomer());
    mockAuditLogCreate.mockResolvedValue({});

    const result = await service.createForCompany(COMPANY_ID, ACTOR_USER_ID, BASE_DTO);

    expect(result.companyCustomerId).toBe('cc-1');
    expect(result.isNewCustomer).toBe(true);
    expect(mockCustomerCreate).toHaveBeenCalledTimes(1);
    expect(mockCompanyCustomerCreate).toHaveBeenCalledTimes(1);
    expect(mockAuditLogCreate).toHaveBeenCalledTimes(1);
  });

  // ===== Customer existente =====
  it('deve reutilizar Customer existente pelo telefone', async () => {
    mockCustomerFindUnique.mockResolvedValue(mockCustomer());
    mockCompanyCustomerFindUnique.mockResolvedValue(null);
    mockCompanyCustomerCreate.mockResolvedValue(mockCompanyCustomer());
    mockAuditLogCreate.mockResolvedValue({});

    const result = await service.createForCompany(COMPANY_ID, ACTOR_USER_ID, BASE_DTO);

    expect(result.isNewCustomer).toBe(false);
    expect(mockCustomerCreate).not.toHaveBeenCalled();
  });

  // ===== Não sobrescrever dados existentes =====
  it('não deve sobrescrever dados do Customer existente', async () => {
    mockCustomerFindUnique.mockResolvedValue(mockCustomer({
      name: 'Nome Original',
      emailNormalized: 'original@email.com',
    }));
    mockCompanyCustomerFindUnique.mockResolvedValue(null);
    mockCompanyCustomerCreate.mockResolvedValue(mockCompanyCustomer());
    mockAuditLogCreate.mockResolvedValue({});

    const result = await service.createForCompany(COMPANY_ID, ACTOR_USER_ID, {
      ...BASE_DTO,
      name: 'Novo Nome',
    });

    expect(result.name).toBe('Nome Original');
  });

  // ===== Vínculo duplicado =====
  it('deve lançar ConflictException para vínculo duplicado', async () => {
    mockCustomerFindUnique.mockResolvedValue(mockCustomer());
    mockCompanyCustomerFindUnique.mockResolvedValue(mockCompanyCustomer());

    await expect(
      service.createForCompany(COMPANY_ID, ACTOR_USER_ID, BASE_DTO),
    ).rejects.toThrow(ConflictException);
  });

  // ===== Telefone inválido =====
  it('deve lançar BadRequestException para telefone inválido', async () => {
    await expect(
      service.createForCompany(COMPANY_ID, ACTOR_USER_ID, { ...BASE_DTO, phone: '123' }),
    ).rejects.toThrow(BadRequestException);
  });

  // ===== CPF inválido =====
  it('deve lançar BadRequestException para CPF inválido', async () => {
    await expect(
      service.createForCompany(COMPANY_ID, ACTOR_USER_ID, {
        ...BASE_DTO,
        cpf: '11111111111',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  // ===== CPF válido gera HMAC =====
  it('deve gerar cpfLookupHash para CPF válido', async () => {
    mockCustomerFindUnique.mockResolvedValue(null);
    mockCustomerCreate.mockResolvedValue(mockCustomer({
      cpfLookupHash: expect.any(String),
      cpfLastDigits: '4725',
    }));
    mockCompanyCustomerFindUnique.mockResolvedValue(null);
    mockCompanyCustomerCreate.mockResolvedValue(mockCompanyCustomer());
    mockAuditLogCreate.mockResolvedValue({});

    await service.createForCompany(COMPANY_ID, ACTOR_USER_ID, {
      ...BASE_DTO,
      cpf: '529.982.247-25',
    });

    expect(mockCustomerCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        cpfLookupHash: expect.any(String),
        cpfLastDigits: expect.any(String),
      }),
    }));
  });

  // ===== CPF sem secret =====
  it('deve falhar se CPF é fornecido mas secret está ausente', async () => {
    mockConfigGet.mockReturnValue('');
    const { PrismaService: PS } = require('../../prisma.service');
    const { ConfigService: CS } = require('@nestjs/config');
    const svc = new CustomersService(new PS(), new CS());

    await expect(
      svc.createForCompany(COMPANY_ID, ACTOR_USER_ID, {
        ...BASE_DTO,
        cpf: '52998224725',
      }),
    ).rejects.toThrow(InternalServerErrorException);
  });

  // ===== Sem CPF funciona sem secret =====
  it('deve funcionar sem CPF mesmo com secret ausente', async () => {
    mockConfigGet.mockReturnValue('');
    const { PrismaService: PS } = require('../../prisma.service');
    const { ConfigService: CS } = require('@nestjs/config');
    const svc = new CustomersService(new PS(), new CS());

    mockCustomerFindUnique.mockResolvedValue(null);
    mockCustomerCreate.mockResolvedValue(mockCustomer());
    mockCompanyCustomerFindUnique.mockResolvedValue(null);
    mockCompanyCustomerCreate.mockResolvedValue(mockCompanyCustomer());
    mockAuditLogCreate.mockResolvedValue({});

    const result = await svc.createForCompany(COMPANY_ID, ACTOR_USER_ID, BASE_DTO);

    expect(result.isNewCustomer).toBe(true);
  });

  // ===== CompanyId não vem do DTO =====
  it('deve usar companyId do contexto, nunca do DTO', async () => {
    mockCustomerFindUnique.mockResolvedValue(null);
    mockCustomerCreate.mockResolvedValue(mockCustomer());
    mockCompanyCustomerFindUnique.mockResolvedValue(null);
    mockCompanyCustomerCreate.mockResolvedValue(mockCompanyCustomer());
    mockAuditLogCreate.mockResolvedValue({});

    await service.createForCompany(COMPANY_ID, ACTOR_USER_ID, BASE_DTO);

    expect(mockCompanyCustomerCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ companyId: COMPANY_ID }),
      }),
    );
  });

  // ===== Email normalizado =====
  it('deve normalizar email para lowercase', async () => {
    mockCustomerFindUnique.mockResolvedValue(null);
    mockCustomerCreate.mockResolvedValue(mockCustomer({ emailNormalized: 'joao@email.com' }));
    mockCompanyCustomerFindUnique.mockResolvedValue(null);
    mockCompanyCustomerCreate.mockResolvedValue(mockCompanyCustomer());
    mockAuditLogCreate.mockResolvedValue({});

    await service.createForCompany(COMPANY_ID, ACTOR_USER_ID, {
      ...BASE_DTO,
      email: 'João@Email.COM',
    });

    expect(mockCustomerCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ emailNormalized: 'joão@email.com' }),
      }),
    );
  });

  // ===== InternalCode duplicado =====
  it('deve rejeitar internalCode duplicado na mesma empresa', async () => {
    mockCustomerFindUnique.mockResolvedValue(mockCustomer());
    mockCompanyCustomerFindUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockCompanyCustomer({ internalCode: 'CLI-001' }));

    await expect(
      service.createForCompany(COMPANY_ID, ACTOR_USER_ID, { ...BASE_DTO, internalCode: 'CLI-001' }),
    ).rejects.toThrow(ConflictException);
  });

  // ===== Transação sem criação parcial em falha =====
  it('não deve criar Customer se CompanyCustomer falhar (transação)', async () => {
    mockCustomerFindUnique.mockResolvedValue(null);
    mockCustomerCreate.mockResolvedValue(mockCustomer());
    mockCompanyCustomerFindUnique.mockResolvedValue(null);
    mockCompanyCustomerCreate.mockRejectedValue(new Error('DB error'));

    await expect(
      service.createForCompany(COMPANY_ID, ACTOR_USER_ID, BASE_DTO),
    ).rejects.toThrow('DB error');
  });

  // ===== Resposta não contém cpfLookupHash =====
  it('não deve retornar cpfLookupHash na resposta', async () => {
    mockCustomerFindUnique.mockResolvedValue(null);
    mockCustomerCreate.mockResolvedValue(mockCustomer());
    mockCompanyCustomerFindUnique.mockResolvedValue(null);
    mockCompanyCustomerCreate.mockResolvedValue(mockCompanyCustomer());
    mockAuditLogCreate.mockResolvedValue({});

    const result = await service.createForCompany(COMPANY_ID, ACTOR_USER_ID, BASE_DTO);

    expect(result).not.toHaveProperty('cpfLookupHash');
    expect(result).not.toHaveProperty('cpfLastDigits');
  });

  // ===== AuditLog com metadados seguros =====
  it('deve registrar AuditLog sem dados pessoais', async () => {
    mockCustomerFindUnique.mockResolvedValue(null);
    mockCustomerCreate.mockResolvedValue(mockCustomer());
    mockCompanyCustomerFindUnique.mockResolvedValue(null);
    mockCompanyCustomerCreate.mockResolvedValue(mockCompanyCustomer());
    mockAuditLogCreate.mockResolvedValue({});

    await service.createForCompany(COMPANY_ID, ACTOR_USER_ID, {
      ...BASE_DTO,
      notes: 'Cliente VIP, telefone: 81999991234',
    });

    expect(mockAuditLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: ACTOR_USER_ID,
          companyId: COMPANY_ID,
          action: 'customer.link.create',
          entity: 'CompanyCustomer',
          metadata: { source: 'manual' },
        }),
      }),
    );
  });

  // ===== Source respeitado =====
  it('deve respeitar source informado no DTO', async () => {
    mockCustomerFindUnique.mockResolvedValue(null);
    mockCustomerCreate.mockResolvedValue(mockCustomer());
    mockCompanyCustomerFindUnique.mockResolvedValue(null);
    mockCompanyCustomerCreate.mockResolvedValue(mockCompanyCustomer({ source: 'qrcode' }));
    mockAuditLogCreate.mockResolvedValue({});

    const result = await service.createForCompany(COMPANY_ID, ACTOR_USER_ID, {
      ...BASE_DTO,
      source: 'qrcode',
    });

    expect(result.source).toBe('qrcode');
  });

  // =====================================================================
  // Listagem — GET /customers
  // =====================================================================
  describe('list — GET /customers', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockConfigGet.mockReturnValue(HMAC_SECRET);
      mockCompanyFindUnique.mockResolvedValue({ id: COMPANY_ID, status: 'active' });
      mockCompanyUserFindUnique.mockResolvedValue({ status: 'active', role: 'owner' });

      const { PrismaService } = require('../../prisma.service');
      const { ConfigService } = require('@nestjs/config');
      service = new CustomersService(new PrismaService(), new ConfigService());
    });

    it('deve listar clientes paginados', async () => {
      const items = [
        {
          id: 'cc-1',
          internalCode: null,
          status: 'active',
          source: 'manual',
          joinedAt: new Date(),
          lastAttendedAt: null,
          notes: null,
          customer: { name: 'João', phoneE164: '+5581999991234', emailNormalized: null },
        },
      ];
      mock$transaction.mockImplementation((queries: any[]) => {
        return Promise.resolve([items, 1]);
      });

      const result = await service.list(COMPANY_ID, ACTOR_USER_ID, { page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.items[0].id).toBe('cc-1');
    });

    it('deve usar page padrão 1 quando omitido', async () => {
      const items: any[] = [];
      mock$transaction.mockImplementation((queries: any[]) => {
        return Promise.resolve([items, 4]);
      });

      const result = await service.list(COMPANY_ID, ACTOR_USER_ID, {});

      expect(result.page).toBe(1);
      expect(result.total).toBe(4);
    });

    it('deve usar limit padrão 20 quando omitido', async () => {
      const items = Array.from({ length: 20 }, (_, i) => ({
        id: `cc-${i}`,
        internalCode: null,
        status: 'active',
        source: 'manual',
        joinedAt: new Date(),
        lastAttendedAt: null,
        notes: null,
        customer: { name: `Cliente ${i}`, phoneE164: `+558199999${String(i).padStart(4, '0')}`, emailNormalized: null },
      }));
      mock$transaction.mockImplementation((queries: any[]) => {
        return Promise.resolve([items, 100]);
      });

      const result = await service.list(COMPANY_ID, ACTOR_USER_ID, {});

      expect(result.limit).toBe(20);
      expect(result.items).toHaveLength(20);
    });

    it('deve respeitar limit máximo 100', async () => {
      const items = Array.from({ length: 100 }, (_, i) => ({
        id: `cc-${i}`,
        internalCode: null,
        status: 'active',
        source: 'manual',
        joinedAt: new Date(),
        lastAttendedAt: null,
        notes: null,
        customer: { name: `Cliente ${i}`, phoneE164: `+558199999${String(i).padStart(4, '0')}`, emailNormalized: null },
      }));
      mock$transaction.mockImplementation((queries: any[]) => {
        return Promise.resolve([items, 200]);
      });

      const result = await service.list(COMPANY_ID, ACTOR_USER_ID, { limit: 100 });

      expect(result.items).toHaveLength(100);
      expect(result.totalPages).toBe(2);
    });

    it('deve filtrar por companyId', async () => {
      mockCompanyCustomerFindMany.mockResolvedValue([]);
      mockCompanyCustomerCount.mockResolvedValue(0);
      mock$transaction.mockImplementation(() => Promise.resolve([[], 0]));

      await service.list(COMPANY_ID, ACTOR_USER_ID, {});
      expect(mockCompanyCustomerFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { companyId: COMPANY_ID } }));
    });

    it('deve retornar total correto', async () => {
      mock$transaction.mockImplementation((queries: any[]) => {
        return Promise.resolve([[], 42]);
      });

      const result = await service.list(COMPANY_ID, ACTOR_USER_ID, {});

      expect(result.total).toBe(42);
      expect(result.totalPages).toBe(3);
    });

    it('não deve retornar cpfLookupHash nem cpfLastDigits', async () => {
      const items = [
        {
          id: 'cc-1',
          internalCode: null,
          status: 'active',
          source: 'manual',
          joinedAt: new Date(),
          lastAttendedAt: null,
          notes: null,
          customer: { name: 'João', phoneE164: '+5581999991234', emailNormalized: null },
        },
      ];
      mock$transaction.mockImplementation((queries: any[]) => {
        return Promise.resolve([items, 1]);
      });

      const result = await service.list(COMPANY_ID, ACTOR_USER_ID, {});

      expect(result.items[0]).not.toHaveProperty('cpfLookupHash');
      expect(result.items[0]).not.toHaveProperty('cpfLastDigits');
    });
  });

  // =====================================================================
  // Busca — GET /customers/search
  // =====================================================================
  describe('search — GET /customers/search', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockConfigGet.mockReturnValue(HMAC_SECRET);
      mockCompanyFindUnique.mockResolvedValue({ id: COMPANY_ID, status: 'active' });
      mockCompanyUserFindUnique.mockResolvedValue({ status: 'active', role: 'owner' });

      const { PrismaService } = require('../../prisma.service');
      const { ConfigService } = require('@nestjs/config');
      service = new CustomersService(new PrismaService(), new ConfigService());
    });

    it('deve buscar por nome', async () => {
      mockCompanyCustomerFindMany.mockResolvedValue([]);
      mockCompanyCustomerCount.mockResolvedValue(0);
      mock$transaction.mockImplementation(() => Promise.resolve([[], 0]));

      await service.search(COMPANY_ID, ACTOR_USER_ID, { name: 'João', page: 1, limit: 20 });
      expect(mockCompanyCustomerFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ AND: expect.arrayContaining([
        { companyId: COMPANY_ID },
        { customer: { name: { contains: 'João', mode: 'insensitive' } } },
      ]) }) }));
    });

    it('deve buscar por telefone', async () => {
      mockCompanyCustomerFindMany.mockResolvedValue([]);
      mockCompanyCustomerCount.mockResolvedValue(0);
      mock$transaction.mockImplementation(() => Promise.resolve([[], 0]));

      await service.search(COMPANY_ID, ACTOR_USER_ID, { phone: '(81) 99999-1234', page: 1, limit: 20 });
      expect(mockCompanyCustomerFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ AND: expect.arrayContaining([
        { companyId: COMPANY_ID },
        { customer: { phoneE164: '+5581999991234' } },
      ]) }) }));
    });

    it('deve buscar por internalCode', async () => {
      mockCompanyCustomerFindMany.mockResolvedValue([]);
      mockCompanyCustomerCount.mockResolvedValue(0);
      mock$transaction.mockImplementation(() => Promise.resolve([[], 0]));

      await service.search(COMPANY_ID, ACTOR_USER_ID, { internalCode: 'CLI-001', page: 1, limit: 20 });
      expect(mockCompanyCustomerFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ AND: expect.arrayContaining([
        { companyId: COMPANY_ID },
        { internalCode: { contains: 'CLI-001', mode: 'insensitive' } },
      ]) }) }));
    });

    it('deve rejeitar nome com menos de 3 caracteres', async () => {
      await expect(
        service.search(COMPANY_ID, ACTOR_USER_ID, { name: 'Jo', page: 1, limit: 20 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve rejeitar telefone inválido', async () => {
      await expect(
        service.search(COMPANY_ID, ACTOR_USER_ID, { phone: '123', page: 1, limit: 20 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve retornar paginação correta', async () => {
      mock$transaction.mockImplementation((queries: any[]) => {
        return Promise.resolve([[], 5]);
      });

      const result = await service.search(COMPANY_ID, ACTOR_USER_ID, { name: 'Maria', page: 2, limit: 2 });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(2);
      expect(result.total).toBe(5);
      expect(result.totalPages).toBe(3);
    });
  });

  // =====================================================================
  // Detalhe — GET /customers/:companyCustomerId
  // =====================================================================
  describe('findById — GET /customers/:companyCustomerId', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockConfigGet.mockReturnValue(HMAC_SECRET);
      mockCompanyFindUnique.mockResolvedValue({ id: COMPANY_ID, status: 'active' });
      mockCompanyUserFindUnique.mockResolvedValue({ status: 'active', role: 'owner' });

      const { PrismaService } = require('../../prisma.service');
      const { ConfigService } = require('@nestjs/config');
      service = new CustomersService(new PrismaService(), new ConfigService());
    });

    it('deve retornar detalhe do próprio tenant', async () => {
      const linkId = 'cc-own-tenant';
      mockCompanyCustomerFindFirst.mockResolvedValue({
        id: linkId,
        internalCode: 'CLI-001',
        status: 'active',
        source: 'manual',
        joinedAt: new Date(),
        lastAttendedAt: null,
        notes: 'VIP',
        customer: {
          name: 'João Silva',
          phoneE164: '+5581999991234',
          emailNormalized: 'joao@email.com',
          birthDate: new Date('1990-05-15'),
        },
      });

      const result = await service.findById(COMPANY_ID, ACTOR_USER_ID, linkId, 'company_owner');

      expect(result.id).toBe(linkId);
      expect(result.name).toBe('João Silva');
      expect(result.phone).toBe('(81) 99999-1234');
      expect(result.email).toBe('joao@email.com');
      expect(result.birthDate).toBe('1990-05-15');
    });

    it('deve buscar com companyId no filtro', async () => {
      mockCompanyCustomerFindFirst.mockResolvedValue({
        id: 'cc-1',
        internalCode: null,
        status: 'active',
        source: 'manual',
        joinedAt: new Date(),
        lastAttendedAt: null,
        notes: null,
        customer: { name: 'Teste', phoneE164: '+5581999990000', emailNormalized: null, birthDate: null },
      });

      await service.findById(COMPANY_ID, ACTOR_USER_ID, 'cc-1', 'company_owner');

      expect(mockCompanyCustomerFindFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cc-1', companyId: COMPANY_ID },
        }),
      );
    });

    it('deve retornar 404 para CompanyCustomer de outro tenant', async () => {
      mockCompanyCustomerFindFirst.mockResolvedValue(null);

      await expect(
        service.findById('other-company', ACTOR_USER_ID, 'cc-outro', 'company_owner'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve retornar 404 quando link não existe', async () => {
      mockCompanyCustomerFindFirst.mockResolvedValue(null);

      await expect(
        service.findById(COMPANY_ID, ACTOR_USER_ID, 'cc-inexistente', 'company_owner'),
      ).rejects.toThrow(NotFoundException);
    });

    it('company_owner deve receber birthDate', async () => {
      mockCompanyCustomerFindFirst.mockResolvedValue({
        id: 'cc-1',
        internalCode: null,
        status: 'active',
        source: 'manual',
        joinedAt: new Date(),
        lastAttendedAt: null,
        notes: null,
        customer: { name: 'Teste', phoneE164: '+5581999990000', emailNormalized: null, birthDate: new Date('1985-03-10') },
      });

      const result = await service.findById(COMPANY_ID, ACTOR_USER_ID, 'cc-1', 'company_owner');

      expect(result.birthDate).toBe('1985-03-10');
    });

    it('employee não deve receber birthDate', async () => {
      mockCompanyCustomerFindFirst.mockResolvedValue({
        id: 'cc-1',
        internalCode: null,
        status: 'active',
        source: 'manual',
        joinedAt: new Date(),
        lastAttendedAt: null,
        notes: null,
        customer: { name: 'Teste', phoneE164: '+5581999990000', emailNormalized: null, birthDate: undefined },
      });

      const result = await service.findById(COMPANY_ID, ACTOR_USER_ID, 'cc-1', 'employee');

      expect(result.birthDate).toBeNull();
    });

    it('deve rejeitar empresa inexistente', async () => {
      mockCompanyFindUnique.mockResolvedValue(null);

      await expect(
        service.findById(COMPANY_ID, ACTOR_USER_ID, 'cc-1', 'company_owner'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve rejeitar empresa inativa', async () => {
      mockCompanyFindUnique.mockResolvedValue({ id: COMPANY_ID, status: 'blocked' });

      await expect(
        service.findById(COMPANY_ID, ACTOR_USER_ID, 'cc-1', 'company_owner'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve rejeitar vínculo do ator inexistente', async () => {
      mockCompanyUserFindUnique.mockResolvedValue(null);

      await expect(
        service.findById(COMPANY_ID, ACTOR_USER_ID, 'cc-1', 'company_owner'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve rejeitar vínculo do ator inativo', async () => {
      mockCompanyUserFindUnique.mockResolvedValue({ status: 'blocked', role: 'employee' });

      await expect(
        service.findById(COMPANY_ID, ACTOR_USER_ID, 'cc-1', 'company_owner'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});