import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { UserRes } from '../../users/dto/users.responses';

export class AuthRes {
  accessToken: string;

  @Type(() => UserRes)
  user: UserRes;
}

@Exclude()
export class AdminProjectRes {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() ?? obj.id)
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  @Type(() => UserRes)
  owner: UserRes;

  @Expose()
  memberCount: number;

  @Expose()
  isMember: boolean;

  @Expose()
  createdAt: Date;
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
