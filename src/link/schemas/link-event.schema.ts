import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
// import { Link } from './link.schema';
import { Transform } from 'class-transformer';

@Schema({ timestamps: true })
export class LinkEvent {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ required: false })
  operating_system?: string;

  @Prop({ required: false })
  city?: string;

  @Prop({ required: false })
  country?: string;

  @Prop({ required: false })
  referrer?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true })
  link: ObjectId;
}

export type LinkEventDocument = HydratedDocument<LinkEvent>;
export const LinkEventSchema = SchemaFactory.createForClass(LinkEvent);
