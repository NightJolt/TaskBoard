import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: ['admin', 'user'], default: 'user' })
  role: string;
}

export type UserDocument = HydratedDocument<User>;
export type UserModel = Model<UserDocument>;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
