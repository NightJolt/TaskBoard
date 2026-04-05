import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserRes } from '../../users/dto/users.responses';
import { UserDocument } from '../../users/schemas/user.schema';

@Injectable()
export class AuthSystemService {
  constructor(private jwtService: JwtService) {}

  generateToken(user: UserDocument): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  sanitizeUser(user: UserDocument): UserRes {
    return plainToInstance(UserRes, user.toObject());
  }
}
