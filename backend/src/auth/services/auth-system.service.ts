import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserRes } from '../../users/dto/users.responses';
import { UserDocument } from '../../users/schemas/user.schema';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class AuthSystemService {
  constructor(
    private jwtService: JwtService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {}

  generateToken(user: UserDocument): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      jti: randomUUID(),
    };
    return this.jwtService.sign(payload);
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
