import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AuthAdminService } from '../services/auth-admin.service';
import { Authenticated, CurrentUser } from '../../common/decorators';
import type { UserDocument } from '../../users/schemas/user.schema';

@Authenticated('admin')
@Controller('auth')
export class AuthAdminController {
  constructor(private authAdminService: AuthAdminService) {}

  @Post('invite-codes')
  generateInviteCode(@CurrentUser() user: UserDocument) {
    return this.authAdminService.generateInviteCode(user);
  }

  @Get('invite-codes')
  getInviteCodes(@CurrentUser() user: UserDocument) {
    return this.authAdminService.getInviteCodes(user);
  }

  @Get('users')
  listUsers() {
    return this.authAdminService.listUsers();
  }

  @Get('projects')
  listAllProjects(@CurrentUser() user: UserDocument) {
    return this.authAdminService.listAllProjects(user);
  }

  @Post('projects/:projectId/join')
  joinProject(
    @CurrentUser() user: UserDocument,
    @Param('projectId') projectId: string,
  ) {
    return this.authAdminService.joinProject(user, projectId);
  }

  @Post('projects/:projectId/leave')
  leaveProject(
    @CurrentUser() user: UserDocument,
    @Param('projectId') projectId: string,
  ) {
    return this.authAdminService.leaveProject(user, projectId);
  }

  @Delete('projects/:projectId')
  deleteProject(@Param('projectId') projectId: string) {
    return this.authAdminService.deleteProject(projectId);
  }
}
