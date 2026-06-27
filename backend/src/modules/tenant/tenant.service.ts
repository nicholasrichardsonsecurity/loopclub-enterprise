import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UserRole, CompanyUserRole } from '@prisma/client';

export interface TenantContext {
  companyId: string;
  companyRole: CompanyUserRole;
}

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolve o contexto empresarial de um usuário.
   * - Admin: retorna null (sem contexto empresarial obrigatório)
   * - Demais perfis: busca CompanyUser ativo, valida coerência e empresa
   */
  async resolveTenant(userId: string, role: UserRole): Promise<TenantContext | null> {
    // Admin não exige contexto empresarial
    if (role === UserRole.admin) {
      return null;
    }

    const vínculos = await this.prisma.companyUser.findMany({
      where: { userId, status: 'active' },
      include: { company: { select: { id: true, status: true } } },
    });

    // Zero vínculos ativos
    if (vínculos.length === 0) {
      throw new ForbiddenException('Nenhum vínculo empresarial encontrado.');
    }

    // Múltiplos vínculos ativos — erro controlado, sem expor detalhes
    if (vínculos.length > 1) {
      this.logger.warn(`Inconsistência: usuário ${userId} possui ${vínculos.length} vínculos ativos.`);
      throw new ForbiddenException('Não foi possível determinar o contexto empresarial deste usuário.');
    }

    const vinculo = vínculos[0];

    // Empresa inativa
    if (vinculo.company.status !== 'active') {
      throw new ForbiddenException('Empresa inativa ou bloqueada.');
    }

    // Validação de coerência: papel global × papel na empresa
    this.validarCoerencia(role, vinculo.role);

    return { companyId: vinculo.companyId, companyRole: vinculo.role };
  }

  private validarCoerencia(userRole: UserRole, companyRole: CompanyUserRole): void {
    const valido =
      (userRole === UserRole.company_owner && companyRole === CompanyUserRole.owner) ||
      (userRole === UserRole.employee && companyRole === CompanyUserRole.employee);

    if (!valido) {
      this.logger.warn(`Incoerência de permissões: UserRole=${userRole}, CompanyUserRole=${companyRole}`);
      throw new ForbiddenException('Não foi possível validar as permissões empresariais deste usuário.');
    }
  }
}
