import { Controller, Get, Header, Ip, Param, Req, Res, Headers } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { LinkService } from './link/link.service';
import { CreateLinkEventDto } from './link/dto/link-event.dto';
import * as geoip from 'geoip-lite';
import * as useragent from 'useragent';
import { getTrueBrowser } from './core/utils';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly linkService: LinkService,
  ) {
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get(':slug')
  @Header(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate',
  )
  async redirectToItem(
    @Param('slug') slug: string,
    @Res() response: Response,
    @Req() request,
    @Ip() ip,
  ) {
    const link = await this.linkService.findOneBySlug(slug);
    if (!link) {
      // Handle the case where ID is not found
      response.status(404).send('Item not found');
    }
    const fccUrl = new URL(link.url);
    const linkEventDto = new CreateLinkEventDto();
    const geo = geoip.lookup(ip);
    console.log(geo);
    const userAgentString = request.headers['user-agent'];
    const agent = useragent.lookup(userAgentString);
    const os = agent.os;
    const device = agent.device;
    const ua = useragent.is(request.headers['user-agent']);
    const country = geo ? geo.country : 'Unknown';
    const city = geo ? geo.city : 'Unknown';
    const browser = getTrueBrowser(ua);
    const referrer = request.headers['referer'];
    console.log(
      `Country: ${country}, City: ${city}, Browser: ${browser},  Device: ${device.family}, OS:  ${os.family},`,
    );
    linkEventDto.link = link._id;
    linkEventDto.city = city;
    linkEventDto.country = country;
    linkEventDto.operating_system = os.family;
    linkEventDto.referrer = referrer ?? 'unknown';

    await this.linkService.createLinkEvent(linkEventDto);
    response.redirect(302, fccUrl.href);
  }
}
