import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/users.service';
import { InviteCode } from '../../users/schemas/invite-code.schema';
import type { InviteCodeModel } from '../../users/schemas/invite-code.schema';
import { AuthSystemService } from './auth-system.service';
import { LoginReq, RegisterReq } from '../dto/auth.requests';
import { AuthRes } from '../dto/auth.responses';

@Injectable()
export class AuthPublicService {
  constructor(
    private usersService: UsersService,
    private authSystemService: AuthSystemService,
    @InjectModel(InviteCode.name)
    private inviteCodeModel: InviteCodeModel,
  ) {}

  async register(dto: RegisterReq): Promise<AuthRes> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      name: dto.name,
    });

    const invite = await this.inviteCodeModel.findOneAndUpdate(
      {
        code: dto.inviteCode,
        isUsed: false,
        expiresAt: { $gt: new Date() },
      },
      {
        isUsed: true,
        usedBy: user.id,
      },
    );

    if (!invite) {
      await user.deleteOne();
      throw new BadRequestException('Invalid or expired invite code');
    }

    return {
      accessToken: this.authSystemService.generateToken(user),
      user: this.authSystemService.sanitizeUser(user),
    };
  }

  async login(dto: LoginReq): Promise<AuthRes> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      accessToken: this.authSystemService.generateToken(user),
      user: this.authSystemService.sanitizeUser(user),
    };
  }
}
