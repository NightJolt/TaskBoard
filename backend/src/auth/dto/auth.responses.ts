import { Exclude, Expose, Transform } from 'class-transformer';

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
  usedBy: any;

  @Expose()
  createdAt: Date;
}
