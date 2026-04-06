import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { InviteCode } from '../../users/schemas/invite-code.schema';
import type { InviteCodeModel } from '../../users/schemas/invite-code.schema';
import { User, UserDocument } from '../../users/schemas/user.schema';
import type { UserModel } from '../../users/schemas/user.schema';
import { Project } from '../../projects/schemas/project.schema';
import type { ProjectModel } from '../../projects/schemas/project.schema';
import { ProjectMember, ProjectRole } from '../../projects/schemas/project-member.schema';
import type { ProjectMemberModel } from '../../projects/schemas/project-member.schema';
import { UserRes } from '../../users/dto/users.responses';
import { AdminProjectRes, InviteCodeRes } from '../dto/auth.responses';

@Injectable()
export class AuthAdminService {
  constructor(
    @InjectModel(InviteCode.name)
    private inviteCodeModel: InviteCodeModel,
    @InjectModel(User.name)
    private userModel: UserModel,
    @InjectModel(Project.name)
    private projectModel: ProjectModel,
    @InjectModel(ProjectMember.name)
    private projectMemberModel: ProjectMemberModel,
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

  async listUsers() {
    const users = await this.userModel
      .find()
      .sort({ createdAt: -1 })
      .lean();
    return users.map((user) => plainToInstance(UserRes, user));
  }

  async listAllProjects(user: UserDocument) {
    const projects = await this.projectModel
      .find()
      .populate('owner', 'email name')
      .sort({ createdAt: -1 })
      .lean();

    const userMemberships = await this.projectMemberModel
      .find({ user: user._id })
      .select('project')
      .lean();
    const memberProjectIds = new Set(
      userMemberships.map((m) => m.project.toString()),
    );

    const results = await Promise.all(
      projects.map(async (p) => {
        const memberCount = await this.projectMemberModel.countDocuments({ project: p._id });
        return plainToInstance(AdminProjectRes, {
          ...p,
          memberCount,
          isMember: memberProjectIds.has(p._id.toString()),
        });
      }),
    );

    return results;
  }

  async joinProject(user: UserDocument, projectId: string) {
    const pid = new Types.ObjectId(projectId);
    const existing = await this.projectMemberModel.findOne({
      project: pid,
      user: user._id,
    });
    if (existing) return;

    await this.projectMemberModel.create({
      project: pid,
      user: user._id,
      role: ProjectRole.Member,
    });
  }

  async leaveProject(user: UserDocument, projectId: string) {
    await this.projectMemberModel.deleteOne({
      project: new Types.ObjectId(projectId),
      user: user._id,
    });
  }

  async deleteProject(projectId: string) {
    const pid = new Types.ObjectId(projectId);
    await this.projectModel.findByIdAndDelete(pid);
    await this.projectMemberModel.deleteMany({ project: pid });
  }
}
