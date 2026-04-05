import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '../schemas/task.schema';

export class CreateTaskReq {
  @IsString()
  @MinLength(1)
  title: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsMongoId()
  @IsOptional()
  assignee?: string;
}

export class UpdateTaskReq {
  @IsString()
  @MinLength(1)
  @IsOptional()
  title?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsMongoId()
  @IsOptional()
  assignee?: string | null;
}
