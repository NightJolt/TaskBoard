import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { UsersModule } from '../users/users.module';
import { AuthSystemService } from './services/auth-system.service';
import { AuthPublicService } from './services/auth-public.service';
import { AuthAdminService } from './services/auth-admin.service';
import { AuthPublicController } from './controllers/auth-public.controller';
import { AuthAuthedController } from './controllers/auth-authed.controller';
import { AuthAdminController } from './controllers/auth-admin.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>(
            'JWT_ACCESS_EXPIRATION',
          ) as StringValue,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthSystemService, AuthPublicService, AuthAdminService, JwtStrategy],
  controllers: [AuthPublicController, AuthAuthedController, AuthAdminController],
  exports: [AuthSystemService],
})
export class AuthModule {}
