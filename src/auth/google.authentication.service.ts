import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { google, Auth } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class GoogleAuthenticationService {
  oauthClient: Auth.OAuth2Client;

  constructor(
    private readonly usersService: UserService,
    private readonly configService: ConfigService,
  ) {
    const clientID = this.configService.get('GOOGLE_AUTH_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_AUTH_CLIENT_SECRET');

    this.oauthClient = new google.auth.OAuth2(clientID, clientSecret);
  }

  async authenticate(token: string) {
    try {
      const tokenInfo = await this.oauthClient.getTokenInfo(token);
      console.log(tokenInfo);
      const email = tokenInfo.email;
      const user = await this.usersService.findOneByEmail(email);
      const userData = await this.getUserData(token);
      const name = userData.name;
      if (!user) {
        return await this.usersService.createWithGoogle(
          email,
          tokenInfo.sub,
          name,
          userData.picture,
        );
      }
      return await this.usersService.updateWithGoogle(
        email,
        tokenInfo.sub,
        name,
        userData.picture,
      );
    } catch (error) {
      console.log(error);
      console.log(error.message);
      if (error?.message == 'invalid_token') {
        throw new UnauthorizedException('Invalid access token');
      }
      if (error.status !== 404) {
        throw new BadRequestException('Google Authentication failed');
      }
      throw InternalServerErrorException;
    }
  }

  async getUserData(token: string) {
    const userInfoClient = google.oauth2('v2').userinfo;

    this.oauthClient.setCredentials({
      access_token: token,
    });

    const userInfoResponse = await userInfoClient.get({
      auth: this.oauthClient,
    });

    return userInfoResponse.data;
  }
}
