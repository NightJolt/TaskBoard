import { Controller, Get } from '@nestjs/common';
import { Authenticated, CurrentUser } from '../../common/decorators';
import type { UserDocument } from '../../users/schemas/user.schema';
import { AuthSystemService } from '../services/auth-system.service';

@Authenticated()
@Controller('auth')
export class AuthAuthedController {
  constructor(private authSystemService: AuthSystemService) {}

  @Get('me')
  getMe(@CurrentUser() user: UserDocument) {
    return this.authSystemService.sanitizeUser(user);
  }
}
