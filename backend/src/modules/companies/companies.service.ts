import { Injectable } from '@nestjs/common';
import { CompanyStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { JwtUser } from '../auth/strategies/jwt.strategy';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(user: JwtUser) {
    const where =
      user.role === UserRole.admin
        ? {}
        : { id: user.companyId };

    return this.prisma.company.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  create(dto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: {
        name: dto.name,
        category: dto.category,
        document: dto.document,
        phone: dto.phone,
        email: dto.email,
        ownerName: dto.ownerName,
      },
    });
  }

  updateStatus(id: string, status: CompanyStatus) {
    return this.prisma.company.update({ where: { id }, data: { status } });
  }
}
