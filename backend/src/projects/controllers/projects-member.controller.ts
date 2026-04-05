import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ProjectsAuthedService } from '../services/projects-authed.service';
import { Authenticated, CurrentProject, ProjectMembership } from '../../common/decorators';
import type { ProjectDocument } from '../schemas/project.schema';
import { UpdateProjectReq } from '../dto/projects.requests';

@ProjectMembership()
@Authenticated()
@Controller('projects/:id')
export class ProjectsMemberController {
  constructor(private projectsAuthedService: ProjectsAuthedService) {}

  @Get()
  getDetail(@CurrentProject() project: ProjectDocument) {
    return this.projectsAuthedService.getDetail(project);
  }

  @Patch()
  update(
    @CurrentProject() project: ProjectDocument,
    @Body() dto: UpdateProjectReq,
  ) {
    return this.projectsAuthedService.update(project, dto);
  }
}
