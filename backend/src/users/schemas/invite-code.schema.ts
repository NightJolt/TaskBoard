import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

@Schema({ timestamps: true })
export class InviteCode {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  usedBy: Types.ObjectId;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  isUsed: boolean;
}

export type InviteCodeDocument = HydratedDocument<InviteCode>;
export type InviteCodeModel = Model<InviteCodeDocument>;

export const InviteCodeSchema = SchemaFactory.createForClass(InviteCode);
