import { Controller, Get, Post } from '@nestjs/common';
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
}
