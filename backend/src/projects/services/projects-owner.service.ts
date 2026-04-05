import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { UsersService } from '../../users/users.service';
import { ProjectMember, ProjectRole } from '../schemas/project-member.schema';
import type { ProjectMemberModel } from '../schemas/project-member.schema';
import type { ProjectDocument } from '../schemas/project.schema';
import { ProjectsAuthedService } from './projects-authed.service';

@Injectable()
export class ProjectsOwnerService {
  constructor(
    private usersService: UsersService,
    private projectsAuthedService: ProjectsAuthedService,
    @InjectModel(ProjectMember.name) private projectMemberModel: ProjectMemberModel,
  ) {}

  async delete(project: ProjectDocument) {
    await project.deleteOne();
    await this.projectMemberModel.deleteMany({ project: project.id });
  }

  async addMember(project: ProjectDocument, email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.projectMemberModel.findOne({
      project: project.id,
      user: user.id,
    });
    if (existing) throw new BadRequestException('User is already a member');

    await this.projectMemberModel.create({
      project: project.id,
      user: user.id,
      role: ProjectRole.Member,
    });

    return this.projectsAuthedService.getDetail(project);
  }

  async removeMember(project: ProjectDocument, userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const membership = await this.projectMemberModel.findOne({
      project: project.id,
      user: userId,
    });
    if (!membership) throw new NotFoundException('Member not found');
    if (membership.role === ProjectRole.Owner) {
      throw new BadRequestException('Cannot remove the owner');
    }

    await membership.deleteOne();
    return this.projectsAuthedService.getDetail(project);
  }
}
