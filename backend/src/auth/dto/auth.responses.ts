import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { UserRes } from '../../users/dto/users.responses';

export class AuthRes {
  accessToken: string;

  @Type(() => UserRes)
  user: UserRes;
}

@Exclude()
export class InviteCodeRes {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @Expose()
  code: string;

  @Expose()
  expiresAt: Date;

  @Expose()
  isUsed: boolean;

  @Expose()
  @Type(() => UserRes)
  usedBy: UserRes | null;

  @Expose()
  createdAt: Date;
}
