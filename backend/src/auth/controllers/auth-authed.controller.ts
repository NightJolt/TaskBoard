import { Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
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

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request) {
    const { jti, exp } = req.user as { jti: string; exp: number };
    await this.authSystemService.logout(jti, exp);
  }
}
