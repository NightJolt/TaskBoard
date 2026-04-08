import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginReq {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class RegisterReq {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  inviteCode: string;
}

export class RefreshReq {
  @IsString()
  refreshToken: string;
}
