import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Patch,
  NotFoundException,
  Param,
  Delete,
} from '@nestjs/common';
import { LinkService } from './link.service';
import { CreateLinkDto, UpdateLinkDto } from './dto/create-link.dto';
import { AuthGuard } from '../core/auth.guard';
import { success } from '../core/utils';

@UseGuards(AuthGuard)
@Controller('v1/links')
export class LinkController {
  constructor(private readonly linkService: LinkService) {
  }

  @Get()
  public async findAll(@Request() req) {
    return await this.linkService.findAll(req.user.userId);
  }

  @Post()
  create(@Request() req, @Body() createLinkDto: CreateLinkDto) {
    return this.linkService.create(createLinkDto, req.user.userId);
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateLinkDto: UpdateLinkDto,
  ) {
    console.log(id);
    const link = await this.linkService.findOneById(id);
    if (!link) {
      throw new NotFoundException('Link not found');
    }
    return await this.linkService.updateLink(
      id,
      updateLinkDto,
      req.user.userId,
    );
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    console.log(id);
    const link = await this.linkService.findOneById(id);
    if (!link) {
      throw new NotFoundException('Link not found');
    }
    const stats = await this.linkService.getLinkStats(link._id);
    return success(stats, 'Link retrieved');
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    console.log(id);
    const link = await this.linkService.findOneById(id);
    if (!link) {
      throw new NotFoundException('Link not found');
    }
    if (link.user != req.user.userId) {
      throw new NotFoundException('Link not found');
    }
    await this.linkService.remove(id);
    return success(null, 'Link deleted');
  }
}
