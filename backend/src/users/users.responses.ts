import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class UserRes {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  role: string;
}
