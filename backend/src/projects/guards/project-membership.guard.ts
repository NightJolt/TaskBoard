import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Project } from '../schemas/project.schema';
import type { ProjectModel } from '../schemas/project.schema';
import { ProjectMember, ProjectRole } from '../schemas/project-member.schema';
import type { ProjectMemberModel } from '../schemas/project-member.schema';
import { PROJECT_ACCESS_KEY, ProjectAccess } from '../../common/decorators/project-membership.decorator';

@Injectable()
export class ProjectMembershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(Project.name) private projectModel: ProjectModel,
    @InjectModel(ProjectMember.name) private projectMemberModel: ProjectMemberModel,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredAccess = this.reflector.get<ProjectAccess>(
      PROJECT_ACCESS_KEY,
      context.getClass(),
    );

    const request = context.switchToHttp().getRequest();
    const projectId = request.params.id;
    const userId = request.user.id;

    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const membership = await this.projectMemberModel.findOne({
      project: project._id,
      user: request.user._id,
    });

    if (!membership) {
      throw new ForbiddenException('Not a member of this project');
    }

    if (requiredAccess === ProjectAccess.Owner && membership.role !== ProjectRole.Owner) {
      throw new ForbiddenException('Owner access required');
    }

    request.project = project;

    return true;
  }
}
