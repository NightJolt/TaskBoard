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
import { LoginReq, RegisterReq } from '../auth.requests';

@Injectable()
export class AuthPublicService {
  constructor(
    private usersService: UsersService,
    private authSystemService: AuthSystemService,
    @InjectModel(InviteCode.name)
    private inviteCodeModel: InviteCodeModel,
  ) {}

  async register(dto: RegisterReq) {
    const invite = await this.inviteCodeModel.findOne({ code: dto.inviteCode });
    if (!invite || invite.isUsed || invite.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired invite code');
    }

    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      name: dto.name,
    });

    invite.isUsed = true;
    invite.usedBy = user._id;
    await invite.save();

    return {
      accessToken: this.authSystemService.generateToken(user),
      user: this.authSystemService.sanitizeUser(user),
    };
  }

  async login(dto: LoginReq) {
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
