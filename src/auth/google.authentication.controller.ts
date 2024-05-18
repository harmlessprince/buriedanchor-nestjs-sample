import { Body, Controller, Post } from '@nestjs/common';
import { TokenPayload } from '../core/utils';
import { GoogleAuthenticationService } from './google.authentication.service';
import { JwtService } from '@nestjs/jwt';
import { SignInWithGoogleDto } from './dtos/login-dto';

@Controller('v1/auth/google-authentication')
export class GoogleAuthenticationController {
  constructor(
    private googleAuthenticationService: GoogleAuthenticationService,
    private readonly jwtService: JwtService,
  ) {
  }


  @Post()
  async login(@Body() loginData: SignInWithGoogleDto) {
    const user = await this.googleAuthenticationService.authenticate(
      loginData.token,
    );
    const payload: TokenPayload = {
      userId: user._id,
      email: user.email,
    };
    return {
      user: { email: user.email, id: user._id },
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
