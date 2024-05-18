import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Link } from './schemas/link.schema';
import { CreateLinkDto, UpdateLinkDto } from './dto/create-link.dto';
import {
  generateSlug,
  isValidHttpUrl, retrieveReferrer,
  shuffleString,
  slugify,
} from '../core/utils';
import { UserService } from '../user/user.service';
import { LinkEvent } from './schemas/link-event.schema';
import { CreateLinkEventDto } from './dto/link-event.dto';

@Injectable()
export class LinkService {
  constructor(
    @InjectModel(Link.name) private linkModel: Model<Link>,
    @InjectModel(LinkEvent.name) private linkEventModel: Model<LinkEvent>,
    private readonly userService: UserService,
  ) {
  }

  async create(createLinkDto: CreateLinkDto, UserID?: string) {
    const user = await this.userService.findOneByID(UserID);
    if (!user) {
      throw new BadRequestException('invalid_user');
    }
    if (!isValidHttpUrl(createLinkDto.url)) {
      throw new BadRequestException('Please provide a valid url');
    }
    if (createLinkDto.slug) {
      createLinkDto.slug = slugify(createLinkDto.slug);
      const slugExists = await this.findOneBySlug(createLinkDto.slug);
      if (slugExists) {
        throw new BadRequestException('Slug has already taken');
      }
    } else {
      createLinkDto.slug = await this.generateUniqueSlug();
    }
    const newUrl: URL = new URL(createLinkDto.url);
    createLinkDto.host = newUrl.host;
    createLinkDto.user = user._id;
    const createdLink = new this.linkModel(createLinkDto);
    return await createdLink.save();
  }

  async updateLink(
    linkId: string,
    updateLinkDto: UpdateLinkDto,
    UserID: string,
  ) {
    const user = await this.userService.findOneByID(UserID);
    if (!user) {
      throw new BadRequestException('invalid_user');
    }
    if (updateLinkDto?.url) {
      if (!isValidHttpUrl(updateLinkDto.url)) {
        throw new BadRequestException('Please provide a valid url');
      }
    }
    if (updateLinkDto?.slug) {
      updateLinkDto.slug = slugify(updateLinkDto.slug);
      const slugExists = await this.findOneBySlug(updateLinkDto.slug);
      if (slugExists && slugExists?.slug != updateLinkDto?.slug) {
        throw new BadRequestException('Slug has already taken');
      }
    }
    if (updateLinkDto?.url) {
      const newUrl: URL = new URL(updateLinkDto.url);
      updateLinkDto.host = newUrl.host;
    }

    const filter = { _id: linkId };
    const update = { ...updateLinkDto };
    const updatedLink = await this.linkModel.findOneAndUpdate(filter, update, {
      new: true,
    });
    if (!updatedLink) {
      throw new NotFoundException('Link not found');
    }
    return updatedLink;
  }

  async remove(id: string) {
    return this.linkModel.deleteOne({ _id: id });
  }

  async findOneBySlug(slug: string): Promise<Link> {
    return await this.linkModel.findOne({ slug: slug }).exec();
  }

  async findOneById(id: string): Promise<Link> {
    return await this.linkModel.findOne({ _id: id }).exec();
  }

  private async generateUniqueSlug(): Promise<string> {
    let generatedSlug = '';
    let lengthOfSlug: number = 6;
    while (true) {
      generatedSlug = generateSlug(lengthOfSlug);
      const exists = await this.findOneBySlug(shuffleString(generatedSlug));
      if (!exists) {
        return generatedSlug;
      }
      lengthOfSlug++;
    }
  }

  public async findAll(UserID: string) {
    const linksWithClicksCount = await this.linkModel.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(UserID), // filtering by user id
        },
      },
      {
        $lookup: {
          from: 'linkevents', // Collection name in MongoDB
          localField: '_id',
          foreignField: 'link', // Field in the linkevents collection that references the User
          as: 'linkevents',
        },
      },
      {
        $addFields: {
          clicksCount: { $size: '$linkevents' },
        },
      },
      {
        $project: {
          linkevents: 0,
        },
      },
    ]);
    // return await this.linkModel.find({ user: UserID }).exec();
    return linksWithClicksCount;
  }

  public async createLinkEvent(createLinkEventDto: CreateLinkEventDto) {
    const createdLinkEvent = new this.linkEventModel(createLinkEventDto);
    await createdLinkEvent.save();
  }

  public async getLinkStats(linkId) {
    console.log(linkId);
    const limit: number = 10;
    const result = await this.linkEventModel.aggregate([
      { $match: { link: linkId } },
      {
        $facet: {
          topCities: [
            {
              $group: {
                _id: '$city',
                cityName: { $first: '$city' },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: limit },
            { $project: { _id: 0, cityName: '$_id', count: 1 } }, // Rename _id to cityName
          ],
          topCountries: [
            {
              $group: {
                _id: '$country',
                countryName: { $first: '$country' },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: limit },
            { $project: { _id: 0, countryName: '$_id', count: 1 } }, // Rename _id to countryName
          ],
          topOperatingSystems: [
            {
              $group: {
                _id: '$operating_system',
                osName: { $first: '$operating_system' },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: limit },
            { $project: { _id: 0, osName: '$_id', count: 1 } },
          ],
          topReferrers: [
            {
              $group: {
                _id: '$referrer',
                referrerName: { $first: '$referrer' },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: limit },
            { $project: { _id: 0, referrerName: '$_id', count: 1 } },
          ],
        },
      },
    ]);
    return {
      topCities: result[0].topCities,
      topCountries: result[0].topCountries,
      topOperatingSystems: result[0].topOperatingSystems,
      topReferrers: result[0].topReferrers,
    };
  }

  public async cleanUpLinkEvents() {
    const events = await this.linkEventModel.find().exec();
    for (const event of events) {
      await this.linkEventModel.findOneAndUpdate(
        { _id: event._id },
        { referrer: retrieveReferrer(event.referrer) },
      );
    }
  }
}
