import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';

describe('CustomersController', () => {
  let controller: CustomersController;
  let service: jest.Mocked<CustomersService>;

  const mockResult = {
    companyCustomerId: 'cc-1',
    customerId: 'cust-1',
    name: 'João Silva',
    phoneE164: '+5581999991234',
    emailNormalized: null,
    internalCode: null,
    status: 'active' as const,
    source: 'manual' as const,
    joinedAt: new Date(),
    isNewCustomer: true,
  };

  beforeEach(() => {
    service = {
      createForCompany: jest.fn(),
    } as any;
    controller = new CustomersController(service);
  });

  // --- Fluxo feliz ---
  it('deve chamar createForCompany com companyId e actorUserId do req.user', async () => {
    service.createForCompany.mockResolvedValue(mockResult);

    const req = { user: { userId: 'actor-uuid', companyId: 'company-alpha', role: 'company_owner' } };
    const dto = { name: 'João Silva', phone: '(81) 99999-1234' };

    const result = await controller.create(req, dto);

    expect(service.createForCompany).toHaveBeenCalledWith('company-alpha', 'actor-uuid', dto);
    expect(result).toEqual(mockResult);
  });

  // --- DTO não contém companyId ---
  it('deve ignorar companyId do body (usar do req.user)', async () => {
    service.createForCompany.mockResolvedValue(mockResult);

    const req = { user: { userId: 'actor-uuid', companyId: 'company-alpha', role: 'company_owner' } };
    const dto = { name: 'João', phone: '(81) 99999-1234' } as any;

    await controller.create(req, dto);

    // O DTO não tem campo companyId, então o controller usa req.user
    expect(service.createForCompany).toHaveBeenCalledWith('company-alpha', 'actor-uuid', dto);
  });

  // --- DTO não contém actorUserId ---
  it('deve ignorar actorUserId do body (usar do req.user)', async () => {
    service.createForCompany.mockResolvedValue(mockResult);

    const req = { user: { userId: 'actor-uuid', companyId: 'company-alpha', role: 'company_owner' } };
    const dto = { name: 'João', phone: '(81) 99999-1234' } as any;

    await controller.create(req, dto);

    expect(service.createForCompany).toHaveBeenCalledWith(expect.any(String), 'actor-uuid', expect.any(Object));
  });

  // --- Propaga BadRequestException ---
  it('deve propagar BadRequestException do service', async () => {
    service.createForCompany.mockRejectedValue(new BadRequestException('Telefone inválido'));

    const req = { user: { userId: 'actor-uuid', companyId: 'company-alpha', role: 'company_owner' } };
    const dto = { name: 'João', phone: '123' };

    await expect(controller.create(req, dto)).rejects.toThrow(BadRequestException);
  });

  // --- Propaga BadRequestException via CpfError ---
  it('deve propagar BadRequestException para CPF inválido', async () => {
    service.createForCompany.mockRejectedValue(new BadRequestException('CPF inválido'));

    const req = { user: { userId: 'actor-uuid', companyId: 'company-alpha', role: 'company_owner' } };
    const dto = { name: 'João', phone: '(81) 99999-1234', cpf: '11111111111' };

    await expect(controller.create(req, dto)).rejects.toThrow(BadRequestException);
  });

  // --- Propaga ForbiddenException ---
  it('deve propagar ForbiddenException do service', async () => {
    service.createForCompany.mockRejectedValue(new ForbiddenException('Empresa inativa'));

    const req = { user: { userId: 'actor-uuid', companyId: 'company-alpha', role: 'company_owner' } };
    const dto = { name: 'João', phone: '(81) 99999-1234' };

    await expect(controller.create(req, dto)).rejects.toThrow(ForbiddenException);
  });

  // --- Propaga ConflictException ---
  it('deve propagar ConflictException do service', async () => {
    service.createForCompany.mockRejectedValue(new ConflictException('Cliente já vinculado'));

    const req = { user: { userId: 'actor-uuid', companyId: 'company-alpha', role: 'company_owner' } };
    const dto = { name: 'João', phone: '(81) 99999-1234' };

    await expect(controller.create(req, dto)).rejects.toThrow(ConflictException);
  });

  // --- Admin bloqueado (@Roles) ---
  it('deve retornar resultado do service', async () => {
    service.createForCompany.mockResolvedValue(mockResult);

    const req = { user: { userId: 'actor-uuid', companyId: 'company-alpha', role: 'company_owner' } };
    const dto = { name: 'João Silva', phone: '(81) 99999-1234' };

    const result = await controller.create(req, dto);
    expect(result).toHaveProperty('companyCustomerId');
    expect(result).toHaveProperty('customerId');
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('phoneE164');
    expect(result).not.toHaveProperty('cpfLookupHash');
    expect(result).not.toHaveProperty('cpfLastDigits');
  });
});