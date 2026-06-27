import { TenantGuard } from './tenant.guard';
import { TenantService } from './tenant.service';
import { REQUIRE_COMPANY_KEY } from './decorators/require-company.decorator';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

describe('TenantGuard', () => {
  let guard: TenantGuard;
  let reflector: jest.Mocked<Reflector>;
  let tenantService: jest.Mocked<TenantService>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    tenantService = { resolveTenant: jest.fn() } as any;
    guard = new TenantGuard(reflector, tenantService);
  });

  // -----------------------------------------------------------------------
  // Cenário 10: rota sem @RequireCompany → não chama TenantService
  // -----------------------------------------------------------------------
  it('deve retornar true sem chamar TenantService quando rota não exige empresa', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ user: { userId: 'u1', role: UserRole.company_owner } }) }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(tenantService.resolveTenant).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Cenário 11: rota com @RequireCompany → chama TenantService e injeta dados
  // -----------------------------------------------------------------------
  it('deve chamar TenantService e injetar companyId e companyRole em request.user', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const request: any = { user: { userId: 'user-1', role: UserRole.company_owner } };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;

    tenantService.resolveTenant.mockResolvedValue({
      companyId: 'company-1',
      companyRole: 'owner' as any,
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(tenantService.resolveTenant).toHaveBeenCalledWith('user-1', UserRole.company_owner);
    expect(request.user.companyId).toBe('company-1');
    expect(request.user.companyRole).toBe('owner');
  });

  // -----------------------------------------------------------------------
  // Cenário 12: admin em rota com @RequireCompany → não exige companyId
  // -----------------------------------------------------------------------
  it('deve permitir admin sem companyId obrigatório', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const request: any = { user: { userId: 'admin-1', role: UserRole.admin } };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;

    tenantService.resolveTenant.mockResolvedValue(null);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(tenantService.resolveTenant).toHaveBeenCalledWith('admin-1', UserRole.admin);
    expect(request.user.companyId).toBeUndefined();
    expect(request.user.companyRole).toBeUndefined();
  });

  // -----------------------------------------------------------------------
  // Cenário 13: erro do TenantService é propagado sem contexto parcial
  // -----------------------------------------------------------------------
  it('deve propagar erro do TenantService sem injetar contexto parcial', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const request: any = { user: { userId: 'user-1', role: UserRole.company_owner } };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;

    tenantService.resolveTenant.mockRejectedValue(new Error('Nenhum vínculo empresarial encontrado.'));

    await expect(guard.canActivate(context)).rejects.toThrow('Nenhum vínculo empresarial encontrado.');
    expect(request.user.companyId).toBeUndefined();
    expect(request.user.companyRole).toBeUndefined();
  });

  // -----------------------------------------------------------------------
  // Cenário 14: request sem usuário autenticado → não gera TypeError
  // -----------------------------------------------------------------------
  it('deve retornar true quando não há usuário autenticado (JwtAuthGuard já tratou)', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const context = {
      switchToHttp: () => ({ getRequest: () => ({}) }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(tenantService.resolveTenant).not.toHaveBeenCalled();
  });
});
