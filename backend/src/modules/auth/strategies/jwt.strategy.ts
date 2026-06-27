import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';

export interface JwtUser {
  userId: string;
  role: UserRole;
  companyId?: string;
  companyRole?: string;
}

interface JwtPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'dev_secret',
    });
  }

  async validate(payload: JwtPayload): Promise<JwtUser> {
    if (!payload.sub || !payload.role) {
      throw new UnauthorizedException('Token inválido.');
    }
    return { userId: payload.sub, role: payload.role as UserRole };
  }
}
