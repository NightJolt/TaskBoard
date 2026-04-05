import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProjectsAuthedService } from '../services/projects-authed.service';
import { Authenticated, CurrentUser } from '../../common/decorators';
import type { UserDocument } from '../../users/schemas/user.schema';
import { CreateProjectReq } from '../dto/projects.requests';

@Authenticated()
@Controller('projects')
export class ProjectsAuthedController {
  constructor(private projectsAuthedService: ProjectsAuthedService) {}

  @Post()
  create(@CurrentUser() user: UserDocument, @Body() dto: CreateProjectReq) {
    return this.projectsAuthedService.create(user, dto);
  }

  @Get()
  listMyProjects(@CurrentUser() user: UserDocument) {
    return this.projectsAuthedService.listMyProjects(user);
  }
}
