import { CompaniesService } from './companies.service';
import { JwtUser } from '../auth/strategies/jwt.strategy';
import { UserRole } from '@prisma/client';

// Mock de PrismaService específico para os métodos usados pelo CompaniesService
const mockFindMany = jest.fn();

jest.mock('../../prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({
    company: { findMany: mockFindMany },
  })),
}));

describe('CompaniesService', () => {
  let service: CompaniesService;

  beforeEach(() => {
    mockFindMany.mockReset();
    const { PrismaService } = require('../../prisma.service');
    service = new CompaniesService(new PrismaService());
  });

  // -----------------------------------------------------------------------
  // Cenário 15: admin → todas as empresas
  // -----------------------------------------------------------------------
  it('deve retornar todas as empresas para admin', async () => {
    const companies = [
      { id: 'c1', name: 'Alpha' },
      { id: 'c2', name: 'Beta' },
    ];
    mockFindMany.mockResolvedValue(companies);

    const user: JwtUser = { userId: 'admin-uuid', role: UserRole.admin };

    const result = await service.findAll(user);

    expect(result).toEqual(companies);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: 'desc' },
    });
  });

  // -----------------------------------------------------------------------
  // Cenário 16: company_owner com companyId → apenas sua empresa
  // -----------------------------------------------------------------------
  it('deve filtrar pela companyId do owner', async () => {
    const companyId = 'company-alpha';
    const company = [{ id: companyId, name: 'Alpha' }];
    mockFindMany.mockResolvedValue(company);

    const user: JwtUser = { userId: 'owner-uuid', role: UserRole.company_owner, companyId, companyRole: 'owner' as any };

    const result = await service.findAll(user);

    expect(result).toEqual(company);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { id: companyId },
      orderBy: { createdAt: 'desc' },
    });
  });

  // -----------------------------------------------------------------------
  // Cenário 17: company_owner sem companyId (sem vínculo resolvido)
  // -----------------------------------------------------------------------
  it('deve retornar lista vazia para company_owner sem companyId', async () => {
    const user: JwtUser = { userId: 'owner-uuid', role: UserRole.company_owner };
    mockFindMany.mockResolvedValue([]);

    const result = await service.findAll(user);

    expect(result).toEqual([]);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { id: undefined },
      orderBy: { createdAt: 'desc' },
    });
  });

  // -----------------------------------------------------------------------
  // Cenário 18: employee → filtrado pelo companyId
  // -----------------------------------------------------------------------
  it('deve filtrar pela companyId do employee', async () => {
    const companyId = 'company-emp';
    const company = [{ id: companyId, name: 'Empresa' }];
    mockFindMany.mockResolvedValue(company);

    const user: JwtUser = { userId: 'emp-uuid', role: UserRole.employee, companyId, companyRole: 'employee' as any };

    const result = await service.findAll(user);

    expect(result).toEqual([{ id: companyId, name: 'Empresa' }]);
  });

  // -----------------------------------------------------------------------
  // Cenário 19: companyId usado exclusivamente do user autenticado
  // -----------------------------------------------------------------------
  it('deve usar companyId exclusivamente do user autenticado', async () => {
    const companyId = 'tenant-only';
    mockFindMany.mockResolvedValue([{ id: companyId, name: 'Tenant' }]);

    const user: JwtUser = { userId: 'owner-uuid', role: UserRole.company_owner, companyId, companyRole: 'owner' as any };
    const result = await service.findAll(user);

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { id: companyId },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toHaveLength(1);
  });
});
