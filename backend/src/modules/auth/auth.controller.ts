import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('health')
  health() {
    return { status: 'ok', service: 'auth' };
  }

  @Post('register')
  @ApiCreatedResponse({ description: 'Cadastro criado com sucesso.' })
  @ApiConflictResponse({ description: 'E-mail já cadastrado.' })
  @ApiBadRequestResponse({ description: 'Dados inválidos.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Login realizado com sucesso.' })
  @ApiUnauthorizedResponse({ description: 'Credenciais inválidas.' })
  @ApiBadRequestResponse({ description: 'Dados inválidos.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
