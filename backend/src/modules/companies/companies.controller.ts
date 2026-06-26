import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@ApiTags('Companies')
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
