import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

export enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in_progress',
  Done = 'done',
}

export enum TaskPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, enum: TaskStatus, default: TaskStatus.Todo })
  status: TaskStatus;

  @Prop({ type: Date, default: null })
  deadline: Date | null;

  @Prop({ required: true, enum: TaskPriority, default: TaskPriority.Medium })
  priority: TaskPriority;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignee: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  project: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export type TaskDocument = HydratedDocument<Task>;
export type TaskModel = Model<TaskDocument>;

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.index({ project: 1, status: 1 });
