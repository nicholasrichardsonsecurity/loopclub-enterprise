import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequireCompany } from '../tenant/decorators/require-company.decorator';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@ApiTags('Companies')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token inválido ou ausente.' })
@ApiForbiddenResponse({ description: 'Acesso negado — perfil sem permissão.' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @Roles('admin', 'company_owner')
  @RequireCompany()
  findAll(@Req() req: any) {
    return this.companiesService.findAll(req.user);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

  @Patch(':id/block')
  @Roles('admin')
  block(@Param('id') id: string) {
    return this.companiesService.updateStatus(id, 'blocked');
  }

  @Patch(':id/unblock')
  @Roles('admin')
  unblock(@Param('id') id: string) {
    return this.companiesService.updateStatus(id, 'active');
  }
}
