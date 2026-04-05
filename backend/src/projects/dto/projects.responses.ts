import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { UserRes } from '../../users/dto/users.responses';

@Exclude()
export class ProjectMemberRes {
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

@Exclude()
export class ProjectRes {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  @Type(() => UserRes)
  owner: UserRes;

  @Expose()
  @Type(() => ProjectMemberRes)
  members: ProjectMemberRes[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
