import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
// import { User } from '../../user/schemas/user.schema';
import { Transform } from 'class-transformer';

@Schema({ timestamps: true })
export class Link {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ required: true})
  url: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: false })
  host: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: ObjectId;
}

export type LinkDocument = HydratedDocument<Link>;
export const LinkSchema = SchemaFactory.createForClass(Link);
