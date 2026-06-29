import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequireCompany } from '../tenant/decorators/require-company.decorator';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

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
}