import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import { InviteCode } from '../../users/schemas/invite-code.schema';
import type { InviteCodeModel } from '../../users/schemas/invite-code.schema';
import { UserDocument } from '../../users/schemas/user.schema';
import { InviteCodeRes } from '../dto/auth.responses';

@Injectable()
export class AuthAdminService {
  constructor(
    @InjectModel(InviteCode.name)
    private inviteCodeModel: InviteCodeModel,
  ) {}

  async generateInviteCode(user: UserDocument) {
    const code = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await this.inviteCodeModel.create({
      code,
      createdBy: user.id,
      expiresAt,
    });

    return plainToInstance(InviteCodeRes, invite.toObject());
  }

  async getInviteCodes(user: UserDocument) {
    const codes = await this.inviteCodeModel
      .find({ createdBy: user.id })
      .sort({ createdAt: -1 })
      .populate('usedBy', 'email name')
      .lean();
    return codes.map((code) => plainToInstance(InviteCodeRes, code));
  }
}
