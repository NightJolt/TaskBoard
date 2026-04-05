import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

export enum ProjectRole {
  Owner = 'owner',
  Member = 'member',
}

@Schema({ timestamps: true })
export class ProjectMember {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  project: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true, enum: ProjectRole, default: ProjectRole.Member })
  role: ProjectRole;
}

export type ProjectMemberDocument = HydratedDocument<ProjectMember>;
export type ProjectMemberModel = Model<ProjectMemberDocument>;

export const ProjectMemberSchema = SchemaFactory.createForClass(ProjectMember);

ProjectMemberSchema.index({ project: 1, user: 1 }, { unique: true });
