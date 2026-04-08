import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import type { StringValue } from 'ms';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserRes } from '../../users/dto/users.responses';
import { UserDocument } from '../../users/schemas/user.schema';
import { UsersService } from '../../users/users.service';
import { TokenBlacklistService } from './token-blacklist.service';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthSystemService {
  private readonly refreshSecret: string;
  private readonly refreshExpiration: string;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokenBlacklistService: TokenBlacklistService,
    private usersService: UsersService,
  ) {
    this.refreshSecret = configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    this.refreshExpiration = configService.getOrThrow<string>('JWT_REFRESH_EXPIRATION');
  }

  generateTokens(user: UserDocument): TokenPair {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      jti: randomUUID(),
    } satisfies JwtPayload);

    const refreshToken = this.jwtService.sign(
      { sub: user.id, jti: randomUUID() },
      { secret: this.refreshSecret, expiresIn: this.refreshExpiration as StringValue },
    );

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: { sub: string; jti: string; exp: number };
    try {
      payload = this.jwtService.verify(refreshToken, { secret: this.refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (await this.tokenBlacklistService.isBlacklisted(payload.jti)) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // Blacklist old refresh token (single-use)
    const ttl = payload.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await this.tokenBlacklistService.blacklist(payload.jti, ttl);
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException();

    return this.generateTokens(user);
  }

  async logout(jti: string, exp: number): Promise<void> {
    const ttl = exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await this.tokenBlacklistService.blacklist(jti, ttl);
    }
  }

  sanitizeUser(user: UserDocument): UserRes {
    return plainToInstance(UserRes, user.toObject());
  }
}
