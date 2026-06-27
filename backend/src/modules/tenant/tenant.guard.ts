import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantService } from './tenant.service';
import { REQUIRE_COMPANY_KEY } from './decorators/require-company.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tenantService: TenantService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireCompany = this.reflector.getAllAndOverride<boolean>(REQUIRE_COMPANY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se a rota não exige contexto empresarial, o guard não faz nada
    if (!requireCompany) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return true; // JwtAuthGuard já tratou 401 antes
    }

    const tenant = await this.tenantService.resolveTenant(user.userId, user.role);

    // Admin retorna null (sem companyId obrigatório)
    if (tenant) {
      request.user.companyId = tenant.companyId;
      request.user.companyRole = tenant.companyRole;
    }

    return true;
  }
}
