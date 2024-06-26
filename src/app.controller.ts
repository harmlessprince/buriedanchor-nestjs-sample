import { Controller, Get, Header, Param, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { LinkService } from './link/link.service';
import { CreateLinkEventDto } from './link/dto/link-event.dto';
import * as geoip from 'geoip-lite';
import * as useragent from 'useragent';
import { getTrueBrowser, retrieveReferrer } from './core/utils';
import * as requestip from 'request-ip';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly linkService: LinkService,
  ) {
  }

  @Get('/')
  getHello(): string {
    return this.appService.getHello();
  }


  @Get('/:slug')
  @Header(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate',
  )
  async redirectToItem(
    @Param('slug') slug: string,
    @Res() response: Response,
    @Req() request,
  ) {
    const link = await this.linkService.findOneBySlug(slug);
    if (link == null) {
      // Handle the case where ID is not found
      return response.status(404).send('Item not found');
    }
    if (!link) {
      // Handle the case where ID is not found
      return response.status(404).send('Item not found');
    }
    const fccUrl = new URL(link.url);
    const linkEventDto = new CreateLinkEventDto();
    const clientIp = requestip.getClientIp(request);
    const geo = geoip.lookup(clientIp);
    console.log(clientIp);
    const userAgentString = request.headers['user-agent'];
    const agent = useragent.lookup(userAgentString);
    const os = agent.os;
    const device = agent.device;
    const ua = useragent.is(request.headers['user-agent']);
    const country = geo ? geo.country : 'Unknown';
    const city = geo ? geo.city : 'Unknown';
    const browser = getTrueBrowser(ua);
    const referrer = retrieveReferrer(request.headers['referer']);
    console.log(
      `Country: ${country}, City: ${city}, Browser: ${browser},  Device: ${device.family}, OS:  ${os.family},`,
    );
    linkEventDto.link = link._id;
    linkEventDto.city = city.length < 1 ? 'Unknown' : city;
    linkEventDto.country = country.length < 1 ? 'Unknown' : country;
    linkEventDto.operating_system =
      os.family.length < 1 ? 'unknown' : os.family;
    linkEventDto.referrer = referrer ?? 'unknown';

    await this.linkService.createLinkEvent(linkEventDto);
    return response.redirect(302, fccUrl.href);
  }
}
