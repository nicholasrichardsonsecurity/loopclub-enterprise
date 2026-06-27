import { ForbiddenException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { UserRole, CompanyUserRole } from '@prisma/client';

// Mock de PrismaService específico para os métodos usados pelo TenantService
const mockFindMany = jest.fn();

jest.mock('../../prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({
    companyUser: { findMany: mockFindMany },
  })),
}));

describe('TenantService', () => {
  let service: TenantService;

  const UUID = () => 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/x/g, () =>
    Math.floor(Math.random() * 16).toString(16),
  );

  beforeEach(() => {
    mockFindMany.mockReset();
    const { PrismaService } = require('../../prisma.service');
    service = new TenantService(new PrismaService());
  });

  // -----------------------------------------------------------------------
  // Cenário 1: company_owner com 1 vínculo ativo + empresa ativa
  // -----------------------------------------------------------------------
  it('deve retornar companyId e companyRole para company_owner com 1 vínculo ativo', async () => {
    const userId = UUID();
    const companyId = UUID();
    mockFindMany.mockResolvedValue([
      {
        companyId,
        userId,
        role: CompanyUserRole.owner,
        status: 'active',
        company: { id: companyId, status: 'active' },
        id: UUID(),
        createdAt: new Date(),
      },
    ]);

    const result = await service.resolveTenant(userId, UserRole.company_owner);

    expect(result).toEqual({ companyId, companyRole: CompanyUserRole.owner });
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId, status: 'active' },
      include: { company: { select: { id: true, status: true } } },
    });
  });

  // -----------------------------------------------------------------------
  // Cenário 2: usuário sem vínculo ativo → 403
  // -----------------------------------------------------------------------
  it('deve lançar ForbiddenException quando não há vínculo ativo', async () => {
    mockFindMany.mockResolvedValue([]);

    await expect(
      service.resolveTenant(UUID(), UserRole.company_owner),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      service.resolveTenant(UUID(), UserRole.company_owner),
    ).rejects.toThrow('Nenhum vínculo empresarial encontrado.');
  });

  // -----------------------------------------------------------------------
  // Cenário 3: múltiplos vínculos ativos → 403, não escolhe o primeiro
  // -----------------------------------------------------------------------
  it('deve lançar ForbiddenException com múltiplos vínculos ativos sem selecionar um', async () => {
    const companyId1 = UUID();
    const companyId2 = UUID();
    const userId = UUID();

    mockFindMany.mockResolvedValue([
      {
        companyId: companyId1,
        userId,
        role: CompanyUserRole.owner,
        status: 'active',
        company: { id: companyId1, status: 'active' },
        id: UUID(),
        createdAt: new Date(),
      },
      {
        companyId: companyId2,
        userId,
        role: CompanyUserRole.owner,
        status: 'active',
        company: { id: companyId2, status: 'active' },
        id: UUID(),
        createdAt: new Date(),
      },
    ]);

    await expect(service.resolveTenant(userId, UserRole.company_owner)).rejects.toThrow(
      ForbiddenException,
    );
    await expect(service.resolveTenant(userId, UserRole.company_owner)).rejects.toThrow(
      'Não foi possível determinar o contexto empresarial deste usuário.',
    );
  });

  // -----------------------------------------------------------------------
  // Cenário 4: vínculo inativo → tratado como ausência de vínculo ativo
  // -----------------------------------------------------------------------
  it('deve tratar vínculo inativo como ausência de vínculo ativo', async () => {
    mockFindMany.mockResolvedValue([]);

    await expect(
      service.resolveTenant(UUID(), UserRole.company_owner),
    ).rejects.toThrow('Nenhum vínculo empresarial encontrado.');
  });

  // -----------------------------------------------------------------------
  // Cenário 5: empresa inativa → 403
  // -----------------------------------------------------------------------
  it('deve lançar ForbiddenException quando a empresa está inativa', async () => {
    const userId = UUID();
    const companyId = UUID();

    mockFindMany.mockResolvedValue([
      {
        companyId,
        userId,
        role: CompanyUserRole.owner,
        status: 'active',
        company: { id: companyId, status: 'blocked' },
        id: UUID(),
        createdAt: new Date(),
      },
    ]);

    await expect(service.resolveTenant(userId, UserRole.company_owner)).rejects.toThrow(
      ForbiddenException,
    );
    await expect(service.resolveTenant(userId, UserRole.company_owner)).rejects.toThrow(
      'Empresa inativa ou bloqueada.',
    );
  });

  // -----------------------------------------------------------------------
  // Cenário 6: company_owner + CompanyUserRole.employee → incoerência
  // -----------------------------------------------------------------------
  it('deve lançar ForbiddenException para company_owner com CompanyUserRole.employee', async () => {
    const userId = UUID();
    const companyId = UUID();

    mockFindMany.mockResolvedValue([
      {
        companyId,
        userId,
        role: CompanyUserRole.employee,
        status: 'active',
        company: { id: companyId, status: 'active' },
        id: UUID(),
        createdAt: new Date(),
      },
    ]);

    await expect(service.resolveTenant(userId, UserRole.company_owner)).rejects.toThrow(
      ForbiddenException,
    );
    await expect(service.resolveTenant(userId, UserRole.company_owner)).rejects.toThrow(
      'Não foi possível validar as permissões empresariais deste usuário.',
    );
  });

  // -----------------------------------------------------------------------
  // Cenário 7: employee + CompanyUserRole.owner → incoerência
  // -----------------------------------------------------------------------
  it('deve lançar ForbiddenException para employee com CompanyUserRole.owner', async () => {
    const userId = UUID();
    const companyId = UUID();

    mockFindMany.mockResolvedValue([
      {
        companyId,
        userId,
        role: CompanyUserRole.owner,
        status: 'active',
        company: { id: companyId, status: 'active' },
        id: UUID(),
        createdAt: new Date(),
      },
    ]);

    await expect(service.resolveTenant(userId, UserRole.employee)).rejects.toThrow(
      ForbiddenException,
    );
    await expect(service.resolveTenant(userId, UserRole.employee)).rejects.toThrow(
      'Não foi possível validar as permissões empresariais deste usuário.',
    );
  });

  // -----------------------------------------------------------------------
  // Cenário 8: CompanyUserRole.manager → não autorizado nesta etapa
  // -----------------------------------------------------------------------
  it('deve lançar ForbiddenException para CompanyUserRole.manager', async () => {
    const userId = UUID();
    const companyId = UUID();

    mockFindMany.mockResolvedValue([
      {
        companyId,
        userId,
        role: CompanyUserRole.manager,
        status: 'active',
        company: { id: companyId, status: 'active' },
        id: UUID(),
        createdAt: new Date(),
      },
    ]);

    await expect(service.resolveTenant(userId, UserRole.employee)).rejects.toThrow(
      ForbiddenException,
    );
    await expect(service.resolveTenant(userId, UserRole.company_owner)).rejects.toThrow(
      ForbiddenException,
    );
  });

  // -----------------------------------------------------------------------
  // Cenário 9: admin → não exige vínculo, retorna null
  // -----------------------------------------------------------------------
  it('deve retornar null para admin sem consultar CompanyUser', async () => {
    const result = await service.resolveTenant(UUID(), UserRole.admin);

    expect(result).toBeNull();
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});
