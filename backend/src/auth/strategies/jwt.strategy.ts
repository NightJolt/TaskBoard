import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { TokenBlacklistService } from '../services/token-blacklist.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    if (await this.tokenBlacklistService.isBlacklisted(payload.jti)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException();

    return Object.assign(user, { jti: payload.jti, exp: payload.exp });
  }
}
