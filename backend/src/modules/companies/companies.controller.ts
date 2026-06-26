import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@ApiTags('Companies')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token inválido ou ausente.' })
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @Post()
  create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

  @Patch(':id/block')
  block(@Param('id') id: string) {
    return this.companiesService.updateStatus(id, 'blocked');
  }

  @Patch(':id/unblock')
  unblock(@Param('id') id: string) {
    return this.companiesService.updateStatus(id, 'active');
  }
}
