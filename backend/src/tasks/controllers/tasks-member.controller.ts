import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TasksMemberService } from '../services/tasks-member.service';
import {
  Authenticated,
  CurrentUser,
  CurrentProject,
  ProjectMembership,
} from '../../common/decorators';
import type { UserDocument } from '../../users/schemas/user.schema';
import type { ProjectDocument } from '../../projects/schemas/project.schema';
import { CreateTaskReq, UpdateTaskReq } from '../dto/tasks.requests';

@ProjectMembership()
@Authenticated()
@Controller('projects/:id/tasks')
export class TasksMemberController {
  constructor(private tasksMemberService: TasksMemberService) {}

  @Post()
  create(
    @CurrentProject() project: ProjectDocument,
    @CurrentUser() user: UserDocument,
    @Body() dto: CreateTaskReq,
  ) {
    return this.tasksMemberService.create(project, user, dto);
  }

  @Get()
  list(@CurrentProject() project: ProjectDocument) {
    return this.tasksMemberService.list(project);
  }

  @Get(':taskId')
  getById(
    @CurrentProject() project: ProjectDocument,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksMemberService.getById(project, taskId);
  }

  @Patch(':taskId')
  update(
    @CurrentProject() project: ProjectDocument,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskReq,
  ) {
    return this.tasksMemberService.update(project, taskId, dto);
  }

  @Delete(':taskId')
  delete(
    @CurrentProject() project: ProjectDocument,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksMemberService.delete(project, taskId);
  }
}
