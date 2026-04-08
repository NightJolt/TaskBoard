import { Body, Controller, Post } from '@nestjs/common';
import { AuthPublicService } from '../services/auth-public.service';
import { AuthSystemService } from '../services/auth-system.service';
import { LoginReq, RegisterReq, RefreshReq } from '../dto/auth.requests';

@Controller('auth')
export class AuthPublicController {
  constructor(
    private authPublicService: AuthPublicService,
    private authSystemService: AuthSystemService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterReq) {
    return this.authPublicService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginReq) {
    return this.authPublicService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshReq) {
    return this.authSystemService.refresh(dto.refreshToken);
  }
}
