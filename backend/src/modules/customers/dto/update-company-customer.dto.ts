import { IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Transform } from 'class-transformer';

@ValidatorConstraint({ name: 'AtLeastOneField', async: false })
class AtLeastOneFieldConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const obj = args.object;
    if (typeof obj !== 'object' || obj === null) return false;
    const hasInternal = 'internalCode' in obj;
    const hasNotes = 'notes' in obj;
    return hasInternal || hasNotes;
  }
  defaultMessage(_args: ValidationArguments): string {
    return 'Body vazio não é permitido';
  }
}

export class UpdateCompanyCustomerDto {
  // Garantir que ao menos um dos campos opcionais seja informado (pode ser null)
  @Validate(AtLeastOneFieldConstraint, { message: 'Body vazio não é permitido', always: true })
  _atLeastOne?: never;

  @IsOptional()
  @ValidateIf((obj) => obj.internalCode !== null)
  @IsString()
  @IsNotEmpty({ message: 'internalCode não pode ser vazio' })
  @MaxLength(30, { message: 'internalCode pode ter no máximo 30 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  internalCode?: string | null;

  @IsOptional()
  @ValidateIf((obj) => obj.notes !== null)
  @IsString()
  @IsNotEmpty({ message: 'notes não pode ser vazio' })
  @MaxLength(500, { message: 'notes pode ter no máximo 500 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  notes?: string | null;
}
