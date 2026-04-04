import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { InviteCode, InviteCodeSchema } from './schemas/invite-code.schema';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: InviteCode.name, schema: InviteCodeSchema },
    ]),
  ],
  providers: [UsersService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}
