import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProjectReq {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateProjectReq {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class AddMemberReq {
  @IsEmail()
  email: string;
}
