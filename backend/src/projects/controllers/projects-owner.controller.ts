import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { ProjectsOwnerService } from '../services/projects-owner.service';
import { Authenticated, CurrentProject, ProjectMembership, ProjectAccess } from '../../common/decorators';
import type { ProjectDocument } from '../schemas/project.schema';
import { AddMemberReq } from '../dto/projects.requests';

@ProjectMembership(ProjectAccess.Owner)
@Authenticated()
@Controller('projects/:id')
export class ProjectsOwnerController {
  constructor(private projectsOwnerService: ProjectsOwnerService) {}

  @Delete()
  async delete(@CurrentProject() project: ProjectDocument) {
    await this.projectsOwnerService.delete(project);
    return { message: 'Project deleted' };
  }

  @Post('members')
  addMember(
    @CurrentProject() project: ProjectDocument,
    @Body() dto: AddMemberReq,
  ) {
    return this.projectsOwnerService.addMember(project, dto.email);
  }

  @Delete('members/:userId')
  removeMember(
    @CurrentProject() project: ProjectDocument,
    @Param('userId') userId: string,
  ) {
    return this.projectsOwnerService.removeMember(project, userId);
  }
}
