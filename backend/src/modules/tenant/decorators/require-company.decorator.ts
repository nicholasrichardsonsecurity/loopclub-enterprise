import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { TenantGuard } from '../tenant.guard';
import { CompanyUserRole } from '@prisma/client';

export const REQUIRE_COMPANY_KEY = 'require_company';

/**
 * Marca uma rota como exigente de contexto empresarial.
 * O TenantGuard lê esta metadata para ativar a resolução de tenant.
 */
export function RequireCompany(): ReturnType<typeof applyDecorators> {
  return applyDecorators(
    SetMetadata(REQUIRE_COMPANY_KEY, true),
    UseGuards(TenantGuard),
  );
}
