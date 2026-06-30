import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { ListCustomersDto } from './dto/list-customers.dto';
import { SearchCustomersDto } from './dto/search-customers.dto';
import { normalizeBrazilianPhoneToE164, PhoneError } from './helpers/phone.helper';
import { isValidCpf, generateCpfLookupHash, getCpfLastDigits, CpfError } from './helpers/cpf.helper';
import { CompanyCustomerSource, Prisma } from '@prisma/client';
import { toCustomerListItem, toCustomerDetailItem } from './dto/customer-response.dto';
import type { PaginatedResult, CustomerListResult, CustomerDetailResult } from './dto/customer-response.dto';

export class BirthDateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BirthDateError';
  }
}

export interface CreateCustomerResult {
  companyCustomerId: string;
  customerId: string;
  name: string;
  phoneE164: string;
  emailNormalized: string | null;
  internalCode: string | null;
  status: string;
  source: string;
  joinedAt: Date;
  isNewCustomer: boolean;
}

const BIRTHDATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MAX_BIRTH_YEAR = 1900;

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);
  private readonly cpfHmacSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.cpfHmacSecret = this.config.get<string>('CUSTOMER_PII_HMAC_SECRET') ?? '';
  }

  /**
   * Cria ou reutiliza um Customer global e vincula à empresa.
   *
   * - companyId vem exclusivamente do contexto autenticado (nunca do DTO)
   * - Operação inteira em transação Prisma
   * - Race conditions tratadas via captura de erros unique
   */
  async createForCompany(
    companyId: string,
    actorUserId: string,
    dto: CreateCustomerDto,
  ): Promise<CreateCustomerResult> {
    // 0. Validar empresa e vínculo do ator
    await this.validateCompanyAndActor(companyId, actorUserId);

    // 0b. Validar birthDate se fornecido
    let birthDate: Date | undefined;
    if (dto.birthDate) {
      try {
        birthDate = this.validateBirthDate(dto.birthDate);
      } catch (err) {
        if (err instanceof BirthDateError) {
          throw new BadRequestException(err.message);
        }
        throw err;
      }
    }

    // 1. Normalizar telefone
    let phoneE164: string;
    try {
      phoneE164 = normalizeBrazilianPhoneToE164(dto.phone);
    } catch (err) {
      if (err instanceof PhoneError) {
        throw new BadRequestException('Telefone inválido');
      }
      throw new PhoneError('Telefone inválido');
    }

    // 2. Normalizar email
    const emailNormalized = dto.email ? dto.email.toLowerCase().trim() : null;

    // 3-5. Processar CPF (se fornecido)
    let cpfData: { hash: string; lastDigits: string } | null = null;
    try {
      cpfData = this.processCpf(dto.cpf);
    } catch (err) {
      if (err instanceof CpfError) {
        throw new BadRequestException('CPF inválido');
      }
      throw err;
    }

    return this.prisma.$transaction(async (tx) => {
      // 6. Buscar Customer pelo telefone
      let customer = await tx.customer.findUnique({
        where: { phoneE164 },
      });

      let isNewCustomer = false;

      if (!customer) {
        // 7. Criar Customer global
        try {
          customer = await tx.customer.create({
            data: {
              name: dto.name.trim(),
              phoneE164,
              emailNormalized,
              ...(cpfData && { cpfLookupHash: cpfData.hash }),
              ...(cpfData && { cpfLastDigits: cpfData.lastDigits }),
              ...(birthDate && { birthDate }),
            },
          });
          isNewCustomer = true;
        } catch (err) {
          if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            const target = extractP2002Target(err);
            if (target === 'phoneE164') {
              customer = await tx.customer.findUnique({ where: { phoneE164 } });
              if (customer) {
                isNewCustomer = false;
              } else {
                throw new InternalServerErrorException('Erro ao criar cliente');
              }
            } else if (target === 'cpfLookupHash' && cpfData) {
              throw new ConflictException('CPF informado já está vinculado a outro cliente');
            } else {
              throw new InternalServerErrorException('Erro ao criar cliente');
            }
          } else {
            throw err;
          }
        }
      } else {
        // 8. Customer existente — verificar conflito de CPF
        if (cpfData && customer.cpfLookupHash) {
          if (!customer.cpfLookupHash.startsWith(cpfData.hash.slice(0, 6))) {
            throw new ConflictException('CPF informado já está vinculado a outro cliente');
          }
        }
      }

      // 9. Verificar vínculo existente
      const existingLink = await tx.companyCustomer.findUnique({
        where: {
          customerId_companyId: {
            customerId: customer.id,
            companyId,
          },
        },
      });

      if (existingLink) {
        throw new ConflictException('Cliente já vinculado a esta empresa');
      }

      // 10. Verificar código interno duplicado
      if (dto.internalCode) {
        const existingCode = await tx.companyCustomer.findUnique({
          where: {
            companyId_internalCode: {
              companyId,
              internalCode: dto.internalCode,
            },
          },
        });
        if (existingCode) {
          throw new ConflictException('Código interno já em uso nesta empresa');
        }
      }

      // 11. Criar CompanyCustomer
      const source = (dto.source ?? 'manual') as CompanyCustomerSource;

      let companyCustomer;
      try {
        companyCustomer = await tx.companyCustomer.create({
          data: {
            customerId: customer.id,
            companyId,
            internalCode: dto.internalCode?.trim() ?? null,
            source,
            notes: dto.notes?.trim() ?? null,
          },
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          const target = extractP2002Target(err);
          if (target === 'customerId_companyId') {
            throw new ConflictException('Cliente já vinculado a esta empresa');
          }
          if (target === 'companyId_internalCode') {
            throw new ConflictException('Código interno já em uso nesta empresa');
          }
          throw new ConflictException('Vínculo duplicado');
        }
        throw err;
      }

      // 12. Registrar auditoria (obrigatório — mesma transação)
      await tx.auditLog.create({
        data: {
          userId: actorUserId,
          companyId,
          action: 'customer.link.create',
          entity: 'CompanyCustomer',
          entityId: companyCustomer.id,
          metadata: { source },
        },
      });

      return {
        companyCustomerId: companyCustomer.id,
        customerId: customer.id,
        name: customer.name,
        phoneE164: customer.phoneE164,
        emailNormalized: customer.emailNormalized,
        internalCode: companyCustomer.internalCode,
        status: companyCustomer.status,
        source: companyCustomer.source,
        joinedAt: companyCustomer.joinedAt,
        isNewCustomer,
      };
    });
  }

  /**
   * Lista clientes da empresa com paginação e ordenação previsível.
   */
  async list(
    companyId: string,
    actorUserId: string,
    dto: ListCustomersDto,
  ): Promise<PaginatedResult<CustomerListResult>> {
    await this.validateCompanyAndActor(companyId, actorUserId);

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.companyCustomer.findMany({
        where: { companyId },
        select: {
          id: true,
          internalCode: true,
          status: true,
          source: true,
          joinedAt: true,
          lastAttendedAt: true,
          notes: true,
          customer: {
            select: {
              name: true,
              phoneE164: true,
              emailNormalized: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: [{ joinedAt: 'desc' }, { id: 'asc' }],
      }),
      this.prisma.companyCustomer.count({ where: { companyId } }),
    ]);

    return {
      items: items.map(toCustomerListItem),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Busca clientes da empresa por nome, telefone ou código interno.
   */
  async search(
    companyId: string,
    actorUserId: string,
    dto: SearchCustomersDto,
  ): Promise<PaginatedResult<CustomerListResult>> {
    await this.validateCompanyAndActor(companyId, actorUserId);

    const { name, phone, internalCode } = dto;

    if (!name && !phone && !internalCode) {
      throw new BadRequestException('Forneça ao menos um termo de busca');
    }

    if (name && name.length < 3) {
      throw new BadRequestException('Nome deve ter no mínimo 3 caracteres');
    }

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    // Filtros — sempre escopados por companyId
    const AND: Prisma.Enumerable<Prisma.CompanyCustomerWhereInput> = [{ companyId }];

    if (name) {
      AND.push({ customer: { name: { contains: name, mode: 'insensitive' } } });
    }

    if (phone) {
      let phoneE164: string;
      try {
        phoneE164 = normalizeBrazilianPhoneToE164(phone);
      } catch {
        throw new BadRequestException('Telefone inválido');
      }
      AND.push({ customer: { phoneE164 } });
    }

    if (internalCode) {
      AND.push({ internalCode: { contains: internalCode, mode: 'insensitive' } });
    }

    const where: Prisma.CompanyCustomerWhereInput = { AND };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.companyCustomer.findMany({
        where,
        select: {
          id: true,
          internalCode: true,
          status: true,
          source: true,
          joinedAt: true,
          lastAttendedAt: true,
          notes: true,
          customer: {
            select: {
              name: true,
              phoneE164: true,
              emailNormalized: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: [{ joinedAt: 'desc' }, { id: 'asc' }],
      }),
      this.prisma.companyCustomer.count({ where }),
    ]);

    return {
      items: items.map(toCustomerListItem),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Retorna detalhe de um CompanyCustomer pelo ID, com isolamento de tenant.
   *
   * company_owner recebe birthDate; employee não.
   */
  async findById(
    companyId: string,
    actorUserId: string,
    companyCustomerId: string,
    actorRole: string,
  ): Promise<CustomerDetailResult> {
    await this.validateCompanyAndActor(companyId, actorUserId);

    const link = await this.prisma.companyCustomer.findFirst({
      where: {
        id: companyCustomerId,
        companyId,
      },
      select: {
        id: true,
        internalCode: true,
        status: true,
        source: true,
        joinedAt: true,
        lastAttendedAt: true,
        notes: true,
        customer: {
          select: {
            name: true,
            phoneE164: true,
            emailNormalized: true,
            birthDate: actorRole === 'company_owner',
          },
        },
      },
    });

    if (!link) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return toCustomerDetailItem(link);
  }

  private async validateCompanyAndActor(companyId: string, actorUserId: string): Promise<void> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, status: true },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    if (company.status !== 'active') {
      throw new ForbiddenException('Empresa inativa ou bloqueada');
    }

    const link = await this.prisma.companyUser.findUnique({
      where: {
        companyId_userId: {
          companyId,
          userId: actorUserId,
        },
      },
      select: { status: true, role: true },
    });

    if (!link) {
      throw new ForbiddenException('Usuário não vinculado a esta empresa');
    }

    if (link.status !== 'active') {
      throw new ForbiddenException('Vínculo empresarial inativo');
    }
  }

  private validateBirthDate(birthDate: string): Date {
    if (!BIRTHDATE_REGEX.test(birthDate)) {
      throw new BirthDateError('Data de nascimento inválida');
    }

    const [y, m, d] = birthDate.split('-').map(Number);
    const parsed = new Date(Date.UTC(y, m - 1, d));

    // Detectar overflow silencioso do JS (ex: 1990-02-30 → 1990-03-02)
    if (
      isNaN(parsed.getTime()) ||
      parsed.getUTCFullYear() !== y ||
      parsed.getUTCMonth() !== m - 1 ||
      parsed.getUTCDate() !== d
    ) {
      throw new BirthDateError('Data de nascimento inválida');
    }

    if (parsed > new Date()) {
      throw new BirthDateError('Data de nascimento não pode ser futura');
    }

    if (y < MAX_BIRTH_YEAR) {
      throw new BirthDateError('Data de nascimento inválida');
    }

    return parsed;
  }

  private processCpf(cpf?: string): { hash: string; lastDigits: string } | null {
    if (!cpf) return null;

    if (!isValidCpf(cpf)) {
      throw new CpfError('CPF inválido');
    }

    if (!this.cpfHmacSecret || this.cpfHmacSecret.length < 32) {
      throw new InternalServerErrorException('Configuração de segurança ausente');
    }

    return {
      hash: generateCpfLookupHash(cpf, this.cpfHmacSecret),
      lastDigits: getCpfLastDigits(cpf),
    };
  }
}

function extractP2002Target(err: Prisma.PrismaClientKnownRequestError): string | null {
  const target = err.meta?.target;
  if (Array.isArray(target) && target.length > 0) {
    return target[0];
  }
  return null;
}