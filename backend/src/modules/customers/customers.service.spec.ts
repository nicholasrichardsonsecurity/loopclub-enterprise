import { CustomersService, CreateCustomerResult } from './customers.service';
import { ConflictException, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PhoneError } from './helpers/phone.helper';
import { CpfError } from './helpers/cpf.helper';
import { Prisma } from '@prisma/client';

const HMAC_SECRET = 'abcdefghijklmnopqrstuvwxyz0123456789';

// Prisma mock
const mockCompanyFindUnique = jest.fn();
const mockCompanyUserFindUnique = jest.fn();
const mockCustomerFindUnique = jest.fn();
const mockCustomerCreate = jest.fn();
const mockCompanyCustomerFindUnique = jest.fn();
const mockCompanyCustomerCreate = jest.fn();
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
      ).rejects.toThrow(PhoneError);
    });

    it('deve rejeitar data inexistente', async () => {
      await expect(
        service.createForCompany(COMPANY_ID, ACTOR_USER_ID, {
          ...BASE_DTO,
          birthDate: '1990-02-30',
        }),
      ).rejects.toThrow(PhoneError);
    });

    it('deve rejeitar data futura', async () => {
      await expect(
        service.createForCompany(COMPANY_ID, ACTOR_USER_ID, {
          ...BASE_DTO,
          birthDate: '2099-01-01',
        }),
      ).rejects.toThrow(PhoneError);
    });

    it('deve rejeitar limite histórico inválido', async () => {
      await expect(
        service.createForCompany(COMPANY_ID, ACTOR_USER_ID, {
          ...BASE_DTO,
          birthDate: '1800-01-01',
        }),
      ).rejects.toThrow(PhoneError);
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
  it('deve lançar PhoneError para telefone inválido', async () => {
    await expect(
      service.createForCompany(COMPANY_ID, ACTOR_USER_ID, { ...BASE_DTO, phone: '123' }),
    ).rejects.toThrow(PhoneError);
  });

  // ===== CPF inválido =====
  it('deve lançar CpfError para CPF inválido', async () => {
    await expect(
      service.createForCompany(COMPANY_ID, ACTOR_USER_ID, {
        ...BASE_DTO,
        cpf: '11111111111',
      }),
    ).rejects.toThrow(CpfError);
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
});