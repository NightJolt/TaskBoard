import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Project } from '../schemas/project.schema';
import type { ProjectModel, ProjectDocument } from '../schemas/project.schema';
import { ProjectMember, ProjectRole } from '../schemas/project-member.schema';
import type { ProjectMemberModel } from '../schemas/project-member.schema';
import { UserDocument } from '../../users/schemas/user.schema';
import { CreateProjectReq, UpdateProjectReq } from '../dto/projects.requests';
import { ProjectRes } from '../dto/projects.responses';

@Injectable()
export class ProjectsAuthedService {
  constructor(
    @InjectModel(Project.name) private projectModel: ProjectModel,
    @InjectModel(ProjectMember.name) private projectMemberModel: ProjectMemberModel,
  ) {}

  async create(user: UserDocument, dto: CreateProjectReq) {
    const project = await this.projectModel.create({
      name: dto.name,
      description: dto.description ?? '',
      owner: user.id,
    });

    await this.projectMemberModel.create({
      project: project.id,
      user: user.id,
      role: ProjectRole.Owner,
    });

    return this.toResponse(project);
  }

  async listMyProjects(user: UserDocument) {
    const memberships = await this.projectMemberModel
      .find({ user: user.id })
      .select('project');

    const projectIds = memberships.map((m) => m.project);

    const projects = await this.projectModel
      .find({ _id: { $in: projectIds } })
      .populate('owner', 'email name')
      .sort({ updatedAt: -1 })
      .lean();

    const results = await Promise.all(
      projects.map(async (p) => {
        const members = await this.projectMemberModel
          .find({ project: p._id })
          .populate('user', 'email name')
          .lean();
        return plainToInstance(ProjectRes, {
          ...p,
          members: members.map((m) => ({ ...m.user, role: m.role })),
        });
      }),
    );

    return results;
  }

  async getDetail(project: ProjectDocument) {
    const members = await this.projectMemberModel
      .find({ project: project.id })
      .populate('user', 'email name')
      .lean();

    const populated = await project.populate('owner', 'email name');

    return plainToInstance(ProjectRes, {
      ...populated.toObject(),
      members: members.map((m) => ({ ...m.user, role: m.role })),
    });
  }

  async update(project: ProjectDocument, dto: UpdateProjectReq) {
    if (dto.name !== undefined) project.name = dto.name;
    if (dto.description !== undefined) project.description = dto.description;
    await project.save();
    return this.getDetail(project);
  }

  private toResponse(project: ProjectDocument): ProjectRes {
    return plainToInstance(ProjectRes, project.toObject());
  }
}
