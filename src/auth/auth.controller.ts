import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login-dto';
import { success } from '../core/utils';
import { AuthGuard } from '../core/auth.guard';

@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const createdUserDto = await this.authService.registerUser(createUserDto);
    const data = {
      user: { email: createdUserDto.email, id: createdUserDto._id },
    };
    return success(data, 'Registration successful');
  }

  @Post('sign/with/firebase')
  async signInWithFirebase(@Body() createUserDto: CreateUserDto) {
    const createdUserDto = await this.authService.registerUser(createUserDto);
    const data = {
      user: { email: createdUserDto.email, id: createdUserDto._id },
    };
    return success(data, 'Registration successful');
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const data = await this.authService.logUserIn(loginDto);
    return success(data, 'Logged successfully');
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async user(@Request() req) {
    const user = await this.authService.getAuthenticatedUser(req.user);
    if (!user) {
      throw new HttpException(
        'invalid user',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const profile = { email: user.email, id: user._id };
    return success(profile, 'Profile Retrieved');
  }
}
