import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../user/schemas/user.schema';

@Schema({ timestamps: true })
export class Link {
  @Prop({ required: true, unique: true })
  url: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true, default: 0 })
  clicks: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;
}

export type LinkDocument = HydratedDocument<Link>;
export const LinkSchema = SchemaFactory.createForClass(Link);
