import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface BeekeeperJwtPayload {
  sub: number;
  type: 'beekeeper';
  openid: string;
}

@Injectable()
export class JwtBeekeeperStrategy extends PassportStrategy(
  Strategy,
  'jwt-beekeeper',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'bee_platform_dev_secret_key'),
    });
  }

  async validate(payload: BeekeeperJwtPayload) {
    if (payload.type !== 'beekeeper') {
      throw new UnauthorizedException('无效的认证类型');
    }
    return {
      id: payload.sub,
      openid: payload.openid,
      type: payload.type,
    };
  }
}
