import { Body, Controller, Get, Param, Post, Patch, Query, Req, UseGuards } from '@nestjs/common';

type AuthenticatedRequest = {
  user: {
    companyId: string;
    userId: string;
    role: 'company_owner' | 'employee';
  };
};
import { ApiBearerAuth, ApiForbiddenResponse, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequireCompany } from '../tenant/decorators/require-company.decorator';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCompanyCustomerDto } from './dto/update-company-customer.dto';
import { ListCustomersDto } from './dto/list-customers.dto';
import { SearchCustomersDto } from './dto/search-customers.dto';

@ApiTags('Customers')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token inválido ou ausente.' })
@ApiForbiddenResponse({ description: 'Acesso negado — perfil sem permissão.' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles('company_owner', 'employee')
  @RequireCompany()
  async create(@Req() req: any, @Body() dto: CreateCustomerDto) {
    const companyId = req.user.companyId;
    const actorUserId = req.user.userId;

    return this.customersService.createForCompany(companyId, actorUserId, dto);
  }

  @Get()
  @Roles('company_owner', 'employee')
  @RequireCompany()
  async list(@Req() req: any, @Query() dto: ListCustomersDto) {
    const companyId = req.user.companyId;
    const actorUserId = req.user.userId;

    return this.customersService.list(companyId, actorUserId, dto);
  }

  @Get('search')
  @Roles('company_owner', 'employee')
  @RequireCompany()
  async search(@Req() req: any, @Query() dto: SearchCustomersDto) {
    const companyId = req.user.companyId;
    const actorUserId = req.user.userId;

    return this.customersService.search(companyId, actorUserId, dto);
  }

  @Get(':companyCustomerId')
  @Roles('company_owner', 'employee')
  @RequireCompany()
  async findById(@Req() req: any, @Param('companyCustomerId') companyCustomerId: string) {
    const companyId = req.user.companyId;
    const actorUserId = req.user.userId;
    const actorRole = req.user.role;

    return this.customersService.findById(companyId, actorUserId, companyCustomerId, actorRole);
  }

  @Patch(':companyCustomerId')
  @Roles('company_owner', 'employee')
  @RequireCompany()
  async updateCompanyCustomer(
    @Req() req: AuthenticatedRequest,
    @Param('companyCustomerId') companyCustomerId: string,
    @Body() dto: UpdateCompanyCustomerDto,
  ) {
    const companyId = req.user.companyId;
    const actorUserId = req.user.userId;
    const actorRole = req.user.role;

    return this.customersService.updateCompanyCustomer(
      companyId,
      actorUserId,
      companyCustomerId,
      actorRole,
      dto,
    );
  }
}