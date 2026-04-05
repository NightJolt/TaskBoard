import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { UserRes } from '../../users/dto/users.responses';

@Exclude()
export class TaskRes {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @Expose()
  title: string;

  @Expose()
  status: string;

  @Expose()
  deadline: Date | null;

  @Expose()
  priority: string;

  @Expose()
  @Type(() => UserRes)
  assignee: UserRes | null;

  @Expose()
  @Type(() => UserRes)
  createdBy: UserRes;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
