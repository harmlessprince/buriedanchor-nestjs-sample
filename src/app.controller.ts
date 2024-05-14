import { Controller, Get, Header, Param, Query, Redirect, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { RedirectResponse } from '@nestjs/core/router/router-response-controller';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('redirect/:id')
  @Header(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate',
  )
  redirectToItem(@Param('id') id: string, @Res() response: Response) {
    const idToUrlMap = {
      '1': 'http://www.youtube.com/@codewithtee',
      '2': 'https://www.linkedin.com/in/adewuyi-taofeeq-olamilekan/',
    };
    const url = idToUrlMap[id];
    if (!url) {
      // Handle the case where ID is not found
      response.status(404).send('Item not found');
    }
    const fccUrl = new URL(url);
    console.log(fccUrl);
    response.redirect(302, fccUrl.href);
  }

  @Get('docs')
  @Redirect('https://docs.nestjs.com', 302)
  getDocs(@Query('version') version) {
    if (version && version === '5') {
      return { url: 'https://docs.nestjs.com/v5/' };
    }
  }
}