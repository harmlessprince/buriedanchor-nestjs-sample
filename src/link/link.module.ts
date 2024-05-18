import { Module } from '@nestjs/common';
import { LinkService } from './link.service';
import { LinkController } from './link.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Link, LinkSchema } from './schemas/link.schema';
import { LinkEvent, LinkEventSchema } from './schemas/link-event.schema';
import { UserModule } from '../user/user.module';

@Module({
  providers: [LinkService],
  controllers: [LinkController],
  imports: [
    UserModule,
    MongooseModule.forFeature([
      {
        name: Link.name,
        schema: LinkSchema,
      },
      {
        name: LinkEvent.name,
        schema: LinkEventSchema,
      },
    ]),
  ],
  exports: [LinkService],
})
export class LinkModule {}
