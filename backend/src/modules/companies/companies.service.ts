import { Injectable } from '@nestjs/common';
import { CompanyStatus } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.company.findMany({ orderBy: { createdAt: 'desc' } });
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
