import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { AuthModule } from '../auth/auth.module';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [AuthModule, TenantModule],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
