import { Body, Controller, Post } from '@nestjs/common';
import { AuthPublicService } from '../services/auth-public.service';
import { LoginReq, RegisterReq } from '../dto/auth.requests';

@Controller('auth')
export class AuthPublicController {
  constructor(private authPublicService: AuthPublicService) {}

  @Post('register')
  register(@Body() dto: RegisterReq) {
    return this.authPublicService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginReq) {
    return this.authPublicService.login(dto);
  }
}
