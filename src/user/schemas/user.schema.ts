import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';
import { Exclude } from 'class-transformer';
import { Transform } from 'class-transformer';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ required: true, unique: true })
  firebase_id: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  photo: string;

  @Prop({ required: false })
  @Exclude()
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
